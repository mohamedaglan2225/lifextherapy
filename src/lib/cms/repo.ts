import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { signedPreviewUrls } from './admin'
import type { DocKind } from './documents'
import { uploadedImagePaths } from './fields'
import { mediaUrl } from './media'

/** Dashboard reads. All go through the admin's own session, so RLS applies. */

export type DocState = {
  kind: DocKind
  key: string
  draft: { data: Record<string, unknown>; version: number; updatedAt: string; updatedByEmail: string | null } | null
  published: { data: Record<string, unknown>; version: number; publishedAt: string } | null
}

export function hasUnpublishedChanges(state: Pick<DocState, 'draft' | 'published'>) {
  if (!state.draft) return false
  if (!state.published) return true
  return JSON.stringify(state.draft.data) !== JSON.stringify(state.published.data)
}

type DraftRow = { key: string; data: Record<string, unknown>; version: number; updated_at: string; updated_by_email: string | null }
type PublishedRow = { key: string; data: Record<string, unknown>; version: number; published_at: string }

export async function listDocStates(supabase: SupabaseClient, kind: DocKind, key?: string): Promise<DocState[]> {
  let drafts = supabase.from('cms_drafts').select('key, data, version, updated_at, updated_by_email').eq('kind', kind)
  let published = supabase.from('cms_published').select('key, data, version, published_at').eq('kind', kind)
  if (key) {
    drafts = drafts.eq('key', key)
    published = published.eq('key', key)
  }
  const [draftResult, publishedResult] = await Promise.all([drafts, published])
  if (draftResult.error || publishedResult.error) throw new Error('The dashboard could not load this content.')

  const publishedByKey = new Map((publishedResult.data as PublishedRow[]).map((row) => [row.key, row]))
  return (draftResult.data as DraftRow[]).map((row) => {
    const live = publishedByKey.get(row.key)
    return {
      kind,
      key: row.key,
      draft: { data: row.data, version: row.version, updatedAt: row.updated_at, updatedByEmail: row.updated_by_email },
      published: live ? { data: live.data, version: live.version, publishedAt: live.published_at } : null,
    }
  })
}

export async function loadDocState(supabase: SupabaseClient, kind: DocKind, key: string): Promise<DocState | null> {
  return (await listDocStates(supabase, kind, key))[0] ?? null
}

export type Revision = { id: number; version: number; publishedAt: string; publishedByEmail: string | null }

export async function listRevisions(supabase: SupabaseClient, kind: DocKind, key: string, limit = 20): Promise<Revision[]> {
  const { data, error } = await supabase
    .from('cms_revisions')
    .select('id, version, published_at, published_by_email')
    .eq('kind', kind)
    .eq('key', key)
    .order('id', { ascending: false })
    .limit(limit)
  if (error) throw new Error('The dashboard could not load the publishing history.')
  return (data ?? []).map((row) => ({
    id: row.id as number,
    version: row.version as number,
    publishedAt: row.published_at as string,
    publishedByEmail: (row.published_by_email as string | null) ?? null,
  }))
}

export type MediaItem = {
  id: string
  path: string
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  alt: string
  originalName: string
  createdAt: string
  isPublic: boolean
  previewUrl: string
  usage: Array<{ kind: DocKind; key: string; state: 'draft' | 'published' }>
}

/** Media with where each file is used (current drafts and published content). */
export async function listMedia(supabase: SupabaseClient): Promise<MediaItem[]> {
  const [media, drafts, published] = await Promise.all([
    supabase.from('cms_media').select('*').order('created_at', { ascending: false }),
    supabase.from('cms_drafts').select('kind, key, data'),
    supabase.from('cms_published').select('kind, key, data'),
  ])
  if (media.error || drafts.error || published.error) throw new Error('The dashboard could not load the media library.')

  const usage = new Map<string, MediaItem['usage']>()
  const record = (rows: Array<{ kind: DocKind; key: string; data: unknown }>, state: 'draft' | 'published') => {
    for (const row of rows) {
      for (const path of uploadedImagePaths(row.data)) {
        usage.set(path, [...(usage.get(path) ?? []), { kind: row.kind, key: row.key, state }])
      }
    }
  }
  record(drafts.data as never, 'draft')
  record(published.data as never, 'published')

  const rows = media.data as Array<Record<string, unknown>>
  const signed = await signedPreviewUrls(
    supabase,
    rows.filter((row) => !row.public_at).map((row) => row.path as string),
  )

  return rows.map((row) => {
    const path = row.path as string
    return {
      id: row.id as string,
      path,
      mimeType: row.mime_type as string,
      sizeBytes: row.size_bytes as number,
      width: (row.width as number | null) ?? null,
      height: (row.height as number | null) ?? null,
      alt: row.alt as string,
      originalName: row.original_name as string,
      createdAt: row.created_at as string,
      isPublic: Boolean(row.public_at),
      previewUrl: row.public_at ? mediaUrl(path) : (signed[path] ?? ''),
      usage: usage.get(path) ?? [],
    }
  })
}
