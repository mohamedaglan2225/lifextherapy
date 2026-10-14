import 'server-only'
import type { z } from 'zod'
import { getSupabaseConfig } from './config'
import { defaultContact, defaultHomeHero } from './defaults'
import {
  contactSchema,
  homeHeroSchema,
  promotionRowSchema,
  toPromotion,
  type Contact,
  type ContentKey,
  type HomeHero,
  type Promotion,
} from './schema'

/**
 * Published content for the public site.
 *
 * Reads are cached by Next.js and tagged, so publishing in the dashboard
 * refreshes exactly the pages that use the changed content (see
 * `src/app/admin/actions`). A time-based refresh is the safety net for edits
 * made outside the dashboard.
 *
 * Failure policy: if Supabase cannot be read, these functions throw. During a
 * background refresh Next.js then keeps serving the last successfully
 * published page; during a build the build fails and the previous deployment
 * stays live. Built-in content is used only when the CMS is not configured or a
 * key has never been published, never to paper over an outage.
 */

export const cmsTags = {
  home_hero: 'cms:home_hero',
  contact: 'cms:contact',
  promotions: 'cms:promotions',
} as const

const REFRESH_SECONDS = 60 * 60

async function readPublished(path: string, tag: string): Promise<unknown[] | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const headers: Record<string, string> = { apikey: config.publishableKey, Accept: 'application/json' }
  // Legacy anon keys are JWTs and also travel as a bearer token; new
  // `sb_publishable_` keys must only be sent as `apikey`.
  if (config.publishableKey.startsWith('eyJ')) headers.Authorization = `Bearer ${config.publishableKey}`

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    headers,
    next: { revalidate: REFRESH_SECONDS, tags: [tag] },
  })
  if (!response.ok) {
    throw new Error(`CMS read failed with status ${response.status} for ${path.split('?')[0]}`)
  }
  const body: unknown = await response.json()
  if (!Array.isArray(body)) throw new Error(`CMS read returned an unexpected body for ${path.split('?')[0]}`)
  return body
}

async function readContent<T>(key: ContentKey, schema: z.ZodType<T>, fallback: T): Promise<T> {
  const rows = await readPublished(`content_published?select=data&key=eq.${key}`, cmsTags[key])
  if (!rows || rows.length === 0) return fallback

  const parsed = schema.safeParse((rows[0] as { data?: unknown }).data)
  if (!parsed.success) throw new Error(`Published "${key}" content failed validation`)
  return parsed.data
}

export function getHomeHero(): Promise<HomeHero> {
  return readContent('home_hero', homeHeroSchema, defaultHomeHero)
}

export function getContact(): Promise<Contact> {
  return readContent('contact', contactSchema, defaultContact)
}

export async function getPromotions(): Promise<Promotion[]> {
  const rows = await readPublished(
    'promotions_published?select=id,title,description,image_path,image_alt,link_url,link_label,sort_order&order=sort_order.asc,published_at.desc',
    cmsTags.promotions,
  )
  if (!rows) return []

  return rows.map((row) => {
    const parsed = promotionRowSchema.safeParse(row)
    if (!parsed.success) throw new Error('A published promotion failed validation')
    return toPromotion(parsed.data)
  })
}
