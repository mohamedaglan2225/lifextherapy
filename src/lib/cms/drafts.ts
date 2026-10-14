import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { z } from 'zod'
import { defaultContact, defaultHomeHero } from './defaults'
import {
  contactSchema,
  homeHeroSchema,
  promotionRowSchema,
  toPromotion,
  type ContentKey,
  type Promotion,
} from './schema'

export type ContentState<T> = {
  /** What the editor shows: the draft, else the published version, else built-in content. */
  value: T
  publishedAt: string | null
  draftUpdatedAt: string | null
  hasUnpublishedChanges: boolean
}

async function readContentState<T>(
  supabase: SupabaseClient,
  key: ContentKey,
  schema: z.ZodType<T>,
  fallback: T,
): Promise<ContentState<T>> {
  const [draftResult, publishedResult] = await Promise.all([
    supabase.from('content_drafts').select('data, updated_at').eq('key', key).maybeSingle(),
    supabase.from('content_published').select('data, published_at').eq('key', key).maybeSingle(),
  ])
  if (draftResult.error || publishedResult.error) throw new Error('The dashboard could not load this content.')

  const draft = schema.safeParse(draftResult.data?.data)
  const published = schema.safeParse(publishedResult.data?.data)
  const value = draft.success ? draft.data : published.success ? published.data : fallback

  return {
    value,
    publishedAt: (publishedResult.data?.published_at as string | undefined) ?? null,
    draftUpdatedAt: (draftResult.data?.updated_at as string | undefined) ?? null,
    hasUnpublishedChanges:
      draft.success && (!published.success || JSON.stringify(draft.data) !== JSON.stringify(published.data)),
  }
}

export function readHomeHeroState(supabase: SupabaseClient) {
  return readContentState(supabase, 'home_hero', homeHeroSchema, defaultHomeHero)
}

export function readContactState(supabase: SupabaseClient) {
  return readContentState(supabase, 'contact', contactSchema, defaultContact)
}

export type PromotionStatus = 'draft' | 'published' | 'changed'

export type PromotionListItem = Promotion & {
  status: PromotionStatus
  updatedAt: string
}

const comparedFields = ['title', 'description', 'imagePath', 'imageAlt', 'linkUrl', 'linkLabel', 'sortOrder'] as const

function promotionStatus(draft: Promotion, published: Promotion | undefined): PromotionStatus {
  if (!published) return 'draft'
  return comparedFields.every((field) => draft[field] === published[field]) ? 'published' : 'changed'
}

const promotionColumns = 'id, title, description, image_path, image_alt, link_url, link_label, sort_order'

export async function listPromotions(supabase: SupabaseClient): Promise<PromotionListItem[]> {
  const [drafts, published] = await Promise.all([
    supabase
      .from('promotion_drafts')
      .select(`${promotionColumns}, updated_at`)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase.from('promotions_published').select(promotionColumns),
  ])
  if (drafts.error || published.error) throw new Error('The dashboard could not load promotions.')

  const publishedById = new Map(
    (published.data ?? []).map((row) => {
      const promotion = toPromotion(promotionRowSchema.parse(row))
      return [promotion.id, promotion] as const
    }),
  )

  return (drafts.data ?? []).map((row) => {
    const promotion = toPromotion(promotionRowSchema.parse(row))
    return {
      ...promotion,
      status: promotionStatus(promotion, publishedById.get(promotion.id)),
      updatedAt: row.updated_at as string,
    }
  })
}

export async function readPromotion(supabase: SupabaseClient, id: string) {
  const items = await listPromotions(supabase)
  return items.find((item) => item.id === id) ?? null
}
