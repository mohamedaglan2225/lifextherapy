import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MEDIA_DRAFT_BUCKET, MEDIA_PUBLIC_BUCKET } from './config'
import { isUploadedImage } from './fields'

export type AdminSession = {
  supabase: SupabaseClient
  userId: string
  email: string | null
}

/**
 * The signed-in user, only if they are a CMS admin.
 *
 * `getClaims()` verifies the session token rather than trusting the cookie, and
 * `is_admin()` checks membership in the database. Row Level Security repeats
 * the same check on every query, so this is defence in depth, not the only gate.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (error || !claims?.sub) return null

  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
  if (adminError || isAdmin !== true) return null

  return {
    supabase,
    userId: claims.sub,
    email: typeof claims.email === 'string' ? claims.email : null,
  }
})

/** For dashboard pages: anyone who is not an admin is sent to the login page. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}

/**
 * Copies an uploaded draft image into the public bucket so published content
 * can reference it. Bundled `/images/...` files need no copy. File names are
 * unique and never reused, so an existing copy is already the right file.
 */
export async function publishMedia(supabase: SupabaseClient, path: string | null) {
  if (!path || !isUploadedImage(path)) return

  const { error } = await supabase.storage
    .from(MEDIA_DRAFT_BUCKET)
    .copy(path, path, { destinationBucket: MEDIA_PUBLIC_BUCKET })
  if (!error) return

  const { code, statusCode } = error as { code?: string; statusCode?: string }
  if (code === 'ResourceAlreadyExists' || statusCode === '409') return

  throw new Error(`The image could not be published: ${error.message}`)
}

/** Short-lived link so the dashboard can preview a private draft image. */
export async function draftPreviewUrl(supabase: SupabaseClient, path: string | null) {
  if (!path) return null
  if (!isUploadedImage(path)) return path
  const { data } = await supabase.storage.from(MEDIA_DRAFT_BUCKET).createSignedUrl(path, 60 * 60)
  return data?.signedUrl ?? null
}
