import 'server-only'
import { cookies, draftMode } from 'next/headers'
import type { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseConfig } from './config'
import { defaultContent } from './defaults'
import {
  isPromotionActive,
  faqsSchema,
  pageSchema,
  promotionSchema,
  serviceSchema,
  settingsSchema,
  type DocKind,
  type FaqsDoc,
  type PageDoc,
  type PromotionDoc,
  type ServiceDoc,
  type Settings,
} from './documents'
import { isUploadedImage } from './fields'
import { PREVIEW_MEDIA_PREFIX } from './media'
import type { PageKey } from './sections'

/**
 * Content for the public site.
 *
 * Published reads are cached by Next.js and tagged; publishing in the
 * dashboard expires exactly the tags it changed. Time-based refresh is the
 * safety net for edits made outside the dashboard, and drives promotion
 * schedules.
 *
 * Failure policy: if Supabase cannot be read these functions throw. A
 * background refresh then keeps serving the last successfully published page;
 * a build fails so the previous deployment stays live. Built-in content is used
 * only when the CMS is not configured or a document has never been published,
 * never to hide an outage.
 *
 * Preview: when an admin enables Draft Mode, drafts are read with their own
 * session (Row Level Security still applies) and images stream through the
 * admin-only preview media route.
 */

export const cmsTags = {
  settings: 'cms:settings',
  page: (key: string) => `cms:page:${key}`,
  services: 'cms:services',
  faqs: 'cms:faqs',
  promotions: 'cms:promotions',
}

export function tagsFor(kind: DocKind, key: string): string[] {
  switch (kind) {
    case 'settings':
      return [cmsTags.settings]
    case 'page':
      return [cmsTags.page(key)]
    case 'service':
      return [cmsTags.services]
    case 'faqs':
      return [cmsTags.faqs]
    case 'promotion':
      return [cmsTags.promotions]
  }
}

const REFRESH_SECONDS = 60 * 60

/**
 * Pages showing promotions refresh at least this often, so scheduled starts and
 * ends take effect without a redeploy. Documented timing tolerance; see
 * docs/cms-setup.md.
 */
export const SCHEDULE_REFRESH_SECONDS = Math.min(
  3600,
  Math.max(30, Number(process.env.CMS_SCHEDULE_REFRESH_SECONDS) || 300),
)

export const PREVIEW_FOCUS_COOKIE = 'lx_preview_focus'

type Row = { key: string; data: unknown }

async function inPreview() {
  try {
    return (await draftMode()).isEnabled
  } catch {
    // No request scope (build-time static params, sitemap generation).
    return false
  }
}

async function readPublished(kind: DocKind, key: string | null, tag: string, revalidate: number): Promise<Row[] | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const headers: Record<string, string> = { apikey: config.publishableKey, Accept: 'application/json' }
  // Legacy anon keys are JWTs and also travel as a bearer token; `sb_publishable_` keys must not.
  if (config.publishableKey.startsWith('eyJ')) headers.Authorization = `Bearer ${config.publishableKey}`

  const filter = key ? `&key=eq.${encodeURIComponent(key)}` : ''
  const response = await fetch(`${config.url}/rest/v1/cms_published?select=key,data&kind=eq.${kind}${filter}`, {
    headers,
    next: { revalidate, tags: [tag] },
  })
  if (!response.ok) throw new Error(`CMS read failed with status ${response.status} for ${kind}`)
  const body: unknown = await response.json()
  if (!Array.isArray(body)) throw new Error(`CMS read returned an unexpected body for ${kind}`)
  return body as Row[]
}

/** Drafts visible to the signed-in admin; null for anyone else. */
async function readDrafts(kind: DocKind, key: string | null): Promise<Row[] | null> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null
  let query = supabase.from('cms_drafts').select('key, data').eq('kind', kind)
  if (key) query = query.eq('key', key)
  const { data, error } = await query
  if (error || !data || data.length === 0) return null
  return data as Row[]
}

async function previewFocus() {
  try {
    return (await cookies()).get(PREVIEW_FOCUS_COOKIE)?.value ?? ''
  } catch {
    return ''
  }
}

/** In preview, show draft versions; lists include the one item being previewed. */
async function readRows(kind: DocKind, key: string | null, tag: string, revalidate: number) {
  const published = await readPublished(kind, key, tag, revalidate)
  if (!(await inPreview())) return { rows: published, preview: false }

  const drafts = await readDrafts(kind, key)
  if (!drafts) return { rows: published, preview: false }
  const focus = await previewFocus()
  const publishedKeys = new Set((published ?? []).map((row) => row.key))
  const rows = drafts.filter((row) => key || publishedKeys.has(row.key) || focus === `${kind}:${row.key}`)
  return { rows, preview: true }
}

function rewriteForPreview<T>(value: T): T {
  if (Array.isArray(value)) return value.map(rewriteForPreview) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entry]) => [
        entryKey,
        entryKey === 'src' && typeof entry === 'string' && isUploadedImage(entry)
          ? `${PREVIEW_MEDIA_PREFIX}${entry}`
          : rewriteForPreview(entry),
      ]),
    ) as T
  }
  return value
}

function parse<T>(schema: z.ZodType, data: unknown, label: string, preview: boolean): T {
  const parsed = schema.safeParse(data)
  if (!parsed.success) throw new Error(`Published ${label} failed validation`)
  return (preview ? rewriteForPreview(parsed.data) : parsed.data) as T
}

export async function getSettings(): Promise<Settings> {
  const { rows, preview } = await readRows('settings', 'site', cmsTags.settings, REFRESH_SECONDS)
  if (!rows?.length) return defaultContent.settings
  return parse<Settings>(settingsSchema, rows[0].data, 'settings', preview)
}

export async function getPage(key: PageKey): Promise<PageDoc> {
  const { rows, preview } = await readRows('page', key, cmsTags.page(key), REFRESH_SECONDS)
  if (!rows?.length) return defaultContent.pages[key]
  return parse<PageDoc>(pageSchema(key), rows[0].data, `page "${key}"`, preview)
}

export type ServiceItem = ServiceDoc & { id: string }

/** Every service, archived ones included, in display order. */
export async function getAllServices(): Promise<ServiceItem[]> {
  const { rows, preview } = await readRows('service', null, cmsTags.services, REFRESH_SECONDS)
  const items = !rows?.length
    ? defaultContent.services.map((service) => ({ ...service.data, id: service.id }))
    : rows.map((row) => ({ ...parse<ServiceDoc>(serviceSchema, row.data, 'service', preview), id: row.key }))
  return items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

export async function getServices(): Promise<ServiceItem[]> {
  return (await getAllServices()).filter((service) => service.status === 'active')
}

export async function getFaqs(): Promise<FaqsDoc> {
  const { rows, preview } = await readRows('faqs', 'all', cmsTags.faqs, REFRESH_SECONDS)
  if (!rows?.length) return defaultContent.faqs
  return parse<FaqsDoc>(faqsSchema, rows[0].data, 'FAQs', preview)
}

export type PromotionItem = PromotionDoc & { id: string }

/** All published promotions; callers filter by placement and schedule. */
export async function getPromotions(): Promise<{ items: PromotionItem[]; preview: boolean }> {
  const { rows, preview } = await readRows('promotion', null, cmsTags.promotions, SCHEDULE_REFRESH_SECONDS)
  const items = (rows ?? []).map((row) => ({ ...parse<PromotionDoc>(promotionSchema, row.data, 'promotion', preview), id: row.key }))
  return { items: items.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)), preview }
}

/** Promotions placed on a page that are inside their schedule right now (all placed drafts in preview). */
export async function getLivePromotions(page: PageKey): Promise<PromotionItem[]> {
  const { items, preview } = await getPromotions()
  const now = Date.now()
  return items.filter((promotion) => promotion.placements.includes(page) && (preview || isPromotionActive(promotion, now)))
}
