'use client'

import { registerMedia } from '@/app/admin/actions/media'
import { getSupabaseConfig, MEDIA_DRAFT_BUCKET, MEDIA_MAX_BYTES, MEDIA_TYPES } from '@/lib/cms/config'
import type { MediaItem } from '@/lib/cms/repo'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export const ACCEPTED_IMAGE_TYPES = Object.keys(MEDIA_TYPES).join(',')

async function dimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  try {
    const bitmap = await createImageBitmap(file)
    const result = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return result
  } catch {
    return { width: null, height: null }
  }
}

/**
 * Uploads to the private drafts bucket (admins only, by Storage policy), then
 * records it in the media library. Type and size are checked here for a quick
 * answer and again by the bucket and the database.
 */
export async function uploadImage(file: File, alt = ''): Promise<{ ok: true; item: MediaItem } | { ok: false; message: string }> {
  const extension = MEDIA_TYPES[file.type]
  if (!extension) return { ok: false, message: `${file.name}: use a JPG, PNG, WebP or AVIF image.` }
  if (file.size > MEDIA_MAX_BYTES) return { ok: false, message: `${file.name}: images must be 5 MB or smaller.` }
  const config = getSupabaseConfig()
  if (!config) return { ok: false, message: 'Uploads are not configured.' }

  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await createSupabaseBrowserClient(config.url, config.publishableKey)
    .storage.from(MEDIA_DRAFT_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
  if (error) return { ok: false, message: `${file.name}: the upload failed. Check your connection and try again.` }

  const { width, height } = await dimensions(file)
  const result = await registerMedia({ path, originalName: file.name, alt, width, height })
  if (!result.ok || !result.item) return { ok: false, message: `${file.name}: ${result.message}` }
  return { ok: true, item: result.item }
}
