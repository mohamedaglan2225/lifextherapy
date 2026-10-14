'use server'

import { updateTag } from 'next/cache'
import { randomUUID } from 'node:crypto'
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { getAdminSession, publishMedia } from '@/lib/cms/admin'
import { defaultContent } from '@/lib/cms/defaults'
import { DOC_KINDS, isValidDocKey, schemaFor, type DocKind, type ServiceDoc } from '@/lib/cms/documents'
import { uploadedImagePaths } from '@/lib/cms/fields'
import { cmsTags, tagsFor } from '@/lib/cms/published'
import { hasUnpublishedChanges, listDocStates, loadDocState } from '@/lib/cms/repo'
import { PAGE_KEYS } from '@/lib/cms/sections'
import { fieldErrorsFrom, sessionEnded, type ActionResult } from './types'

function isKind(value: unknown): value is DocKind {
  return typeof value === 'string' && (DOC_KINDS as readonly string[]).includes(value)
}

function dbFailure(error: PostgrestError, fallback: string): ActionResult {
  switch (error.code) {
    case '40001':
      return {
        ok: false,
        conflict: true,
        message: 'Someone else saved this since you opened it. Reload to see their version; your edits are still on screen until you do.',
      }
    case '42501':
      return sessionEnded
    case '22023':
    case 'P0001':
    case '23503':
      return { ok: false, message: error.message.charAt(0).toUpperCase() + error.message.slice(1) + '.' }
    case 'P0002':
      return { ok: false, message: 'This content no longer exists.' }
    case '23505':
      return { ok: false, message: 'That address is already used by another service.', fieldErrors: { slug: 'Already used by another service.' } }
    default:
      return { ok: false, message: fallback }
  }
}

/** Expires the cached public pages that show this document. Returns false if the refresh failed. */
function refreshLiveSite(kind: DocKind, key: string) {
  try {
    for (const tag of tagsFor(kind, key)) updateTag(tag)
    return true
  } catch {
    return false
  }
}

/** Service-specific rules: unique addresses, and old addresses kept for redirects. */
async function prepareService(supabase: SupabaseClient, key: string, data: ServiceDoc): Promise<ActionResult | ServiceDoc> {
  const services = await listDocStates(supabase, 'service')
  const others = services.filter((service) => service.key !== key)
  const taken = others.some((service) => {
    const other = service.draft?.data as ServiceDoc | undefined
    return other && (other.slug === data.slug || other.previousSlugs.includes(data.slug))
  })
  if (taken) return { ok: false, message: 'Please fix the highlighted fields.', fieldErrors: { slug: 'This address is already used by another service.' } }

  const current = services.find((service) => service.key === key)
  const liveSlug = (current?.published?.data as ServiceDoc | undefined)?.slug
  const previous = new Set(data.previousSlugs)
  // A published address that changes keeps redirecting to the new one.
  if (liveSlug && liveSlug !== data.slug) previous.add(liveSlug)
  previous.delete(data.slug)
  return { ...data, previousSlugs: [...previous] }
}

/** Page rule beyond the schema: featured services must exist. */
async function preparePage(supabase: SupabaseClient, data: Record<string, unknown>): Promise<ActionResult | null> {
  const sections = (data.sections as Array<{ type: string; data: Record<string, unknown> }>) ?? []
  const featured = sections.filter((section) => section.type === 'featured_services')
  if (featured.length === 0) return null
  const slugs = new Set(
    (await listDocStates(supabase, 'service')).map((service) => (service.draft?.data as ServiceDoc | undefined)?.slug),
  )
  const errors: Record<string, string> = {}
  sections.forEach((section, sectionIndex) => {
    if (section.type !== 'featured_services') return
    ;(section.data.items as Array<{ service: string }>).forEach((item, itemIndex) => {
      if (!slugs.has(item.service)) errors[`sections.${sectionIndex}.data.items.${itemIndex}.service`] = 'Choose a service that exists.'
    })
  })
  return Object.keys(errors).length ? { ok: false, message: 'Please fix the highlighted fields.', fieldErrors: errors } : null
}

async function publishVersion(supabase: SupabaseClient, kind: DocKind, key: string, version: number): Promise<ActionResult> {
  const state = await loadDocState(supabase, kind, key)
  if (!state?.draft) return { ok: false, message: 'This content no longer exists.' }
  if (state.draft.version !== version) return dbFailure({ code: '40001' } as PostgrestError, '')

  const parsed = schemaFor(kind, key).safeParse(state.draft.data)
  if (!parsed.success) {
    return { ok: false, message: 'The saved draft has problems. Fix the highlighted fields and save again.', fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  try {
    for (const path of uploadedImagePaths(state.draft.data)) await publishMedia(supabase, path)
  } catch (error) {
    return { ok: false, message: `Not published: ${(error as Error).message}` }
  }

  const { error } = await supabase.rpc('cms_publish', { p_kind: kind, p_key: key, p_expected_version: version })
  if (error) return dbFailure(error, 'Publishing failed. Your draft is saved; please try again.')

  if (!refreshLiveSite(kind, key)) {
    return {
      ok: true,
      published: true,
      refreshFailed: true,
      version,
      message: 'Published to the database, but the live website could not be refreshed yet. Use "Refresh live site" to try again; otherwise pages update within an hour.',
    }
  }
  return { ok: true, published: true, version, message: 'Published. The live website now shows these changes.' }
}

export type SaveInput = {
  kind: DocKind
  key: string
  data: unknown
  expectedVersion: number | null
  publish: boolean
}

export async function saveDocument(input: SaveInput): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  const { supabase } = session
  if (!isKind(input.kind) || !isValidDocKey(input.kind, input.key)) return { ok: false, message: 'Unknown content.' }

  const parsed = schemaFor(input.kind, input.key).safeParse(input.data)
  if (!parsed.success) return { ok: false, message: 'Please fix the highlighted fields.', fieldErrors: fieldErrorsFrom(parsed.error) }
  let data = parsed.data as Record<string, unknown>

  if (input.kind === 'service') {
    const prepared = await prepareService(supabase, input.key, data as ServiceDoc)
    if ('ok' in prepared) return prepared
    data = prepared as unknown as Record<string, unknown>
  }
  if (input.kind === 'page') {
    const problem = await preparePage(supabase, data)
    if (problem) return problem
  }

  const { data: version, error } = await supabase.rpc('cms_save_draft', {
    p_kind: input.kind,
    p_key: input.key,
    p_data: data,
    p_expected_version: input.expectedVersion,
  })
  if (error) return dbFailure(error, 'The draft could not be saved. Please try again.')

  if (!input.publish) {
    return { ok: true, version: version as number, data, message: 'Draft saved. Visitors still see the published version until you publish.' }
  }
  const result = await publishVersion(supabase, input.kind, input.key, version as number)
  return { ...result, version: version as number, data, message: result.ok ? result.message : `Draft saved. ${result.message}` }
}

export async function publishDocument(kind: DocKind, key: string, version: number): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  if (!isKind(kind) || !isValidDocKey(kind, key) || !Number.isInteger(version)) return { ok: false, message: 'Unknown content.' }
  return publishVersion(session.supabase, kind, key, version)
}

/** Retry path when publishing worked but refreshing the live site did not. */
export async function refreshDocument(kind: DocKind, key: string): Promise<ActionResult> {
  if (!(await getAdminSession())) return sessionEnded
  if (!isKind(kind) || !isValidDocKey(kind, key)) return { ok: false, message: 'Unknown content.' }
  return refreshLiveSite(kind, key)
    ? { ok: true, message: 'The live website has been refreshed.' }
    : { ok: false, refreshFailed: true, message: 'The live website could not be refreshed. Please try again in a minute.' }
}

export async function refreshEverything(): Promise<ActionResult> {
  if (!(await getAdminSession())) return sessionEnded
  try {
    for (const tag of [cmsTags.settings, cmsTags.services, cmsTags.faqs, cmsTags.promotions, ...PAGE_KEYS.map(cmsTags.page)]) updateTag(tag)
    return { ok: true, message: 'Every page will be rebuilt from the published content on its next visit.' }
  } catch {
    return { ok: false, refreshFailed: true, message: 'The live website could not be refreshed. Please try again in a minute.' }
  }
}

export async function unpublishDocument(kind: DocKind, key: string): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  if (kind !== 'promotion' || !isValidDocKey(kind, key)) return { ok: false, message: 'Only promotions can be hidden.' }
  const { error } = await session.supabase.rpc('cms_unpublish', { p_kind: kind, p_key: key })
  if (error) return dbFailure(error, 'The promotion could not be hidden. Please try again.')
  return refreshLiveSite(kind, key)
    ? { ok: true, message: 'Hidden. The promotion is no longer on the website.' }
    : { ok: true, refreshFailed: true, message: 'Hidden in the database, but the live website could not be refreshed yet. Use "Refresh live site".' }
}

export async function deleteDocument(kind: DocKind, key: string, version: number): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  if ((kind !== 'promotion' && kind !== 'service') || !isValidDocKey(kind, key)) return { ok: false, message: 'This content cannot be deleted.' }
  const { error } = await session.supabase.rpc('cms_delete', { p_kind: kind, p_key: key, p_expected_version: version })
  if (error) return dbFailure(error, 'It could not be deleted. Please try again.')
  refreshLiveSite(kind, key)
  return { ok: true, message: 'Deleted.' }
}

export async function restoreRevision(kind: DocKind, key: string, revisionId: number, expectedVersion: number): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  if (!isKind(kind) || !isValidDocKey(kind, key)) return { ok: false, message: 'Unknown content.' }
  const { data: revision, error: readError } = await session.supabase
    .from('cms_revisions')
    .select('kind, key')
    .eq('id', revisionId)
    .maybeSingle()
  if (readError || !revision || revision.kind !== kind || revision.key !== key) return { ok: false, message: 'That version was not found.' }

  const { data: version, error } = await session.supabase.rpc('cms_restore', { p_revision_id: revisionId, p_expected_version: expectedVersion })
  if (error) return dbFailure(error, 'That version could not be restored. Please try again.')
  return { ok: true, version: version as number, message: 'That version is now your draft. Review it, then publish to make it live.' }
}

function newServiceData(slug: string, sortOrder: number): ServiceDoc {
  const template = defaultContent.services[0].data
  return {
    ...template,
    slug,
    previousSlugs: [],
    status: 'active',
    sortOrder,
    name: 'New service',
    shortName: 'New',
    intro: 'A one-sentence introduction to this service.',
    description: 'A short description shown on service cards.',
    about: ['Describe what this session is.'],
    whatToExpect: ['Describe how the session runs.'],
    focusAreas: [{ title: 'Focus area', body: 'Describe where the work goes.' }],
    suitableFor: ['Who this session may suit'],
    featuredOnHome: false,
    sessions: [{ minutes: 60, price: 0, vagaroUrl: '' }],
    seo: { title: '', description: '', shareImage: { src: '', alt: '' } },
  }
}

/** Creates a draft service or promotion and returns its key. */
export async function createDocument(kind: 'service' | 'promotion'): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  const { supabase } = session
  const key = randomUUID()
  const existing = await listDocStates(supabase, kind)
  const sortOrder = Math.min(999, existing.reduce((max, doc) => Math.max(max, Number(doc.draft?.data.sortOrder ?? 0)), -1) + 1)

  let data: Record<string, unknown>
  if (kind === 'service') {
    const used = new Set(existing.flatMap((doc) => {
      const service = doc.draft?.data as ServiceDoc | undefined
      return service ? [service.slug, ...service.previousSlugs] : []
    }))
    let slug = 'new-service'
    for (let n = 2; used.has(slug); n += 1) slug = `new-service-${n}`
    data = newServiceData(slug, sortOrder) as unknown as Record<string, unknown>
  } else if (kind === 'promotion') {
    data = {
      title: 'New promotion',
      description: '',
      image: { src: '', alt: '' },
      link: { label: '', href: '', ariaLabel: '' },
      placements: ['home'],
      startsAt: '',
      endsAt: '',
      sortOrder,
    }
  } else {
    return { ok: false, message: 'This content cannot be created.' }
  }

  const { error } = await supabase.rpc('cms_save_draft', { p_kind: kind, p_key: key, p_data: data, p_expected_version: null })
  if (error) return dbFailure(error, 'It could not be created. Please try again.')
  return { ok: true, key, version: 1, message: 'Created as a draft.' }
}

/**
 * Moves a service or promotion up or down. Items with no other pending changes
 * are republished straight away so the new order goes live; items with pending
 * edits only get the new order in their draft.
 */
export async function moveDocument(kind: 'service' | 'promotion', key: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  const { supabase } = session
  if ((kind !== 'service' && kind !== 'promotion') || !isValidDocKey(kind, key)) return { ok: false, message: 'Unknown content.' }

  const docs = (await listDocStates(supabase, kind)).sort(
    (a, b) => Number(a.draft?.data.sortOrder ?? 0) - Number(b.draft?.data.sortOrder ?? 0) || a.key.localeCompare(b.key),
  )
  const index = docs.findIndex((doc) => doc.key === key)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || target < 0 || target >= docs.length) return { ok: true, message: 'Already at the end of the list.' }
  ;[docs[index], docs[target]] = [docs[target], docs[index]]

  let pendingOnly = 0
  for (const [order, doc] of docs.entries()) {
    if (!doc.draft || Number(doc.draft.data.sortOrder) === order) continue
    const cleanBefore = doc.published !== null && !hasUnpublishedChanges(doc)
    const { data: version, error } = await supabase.rpc('cms_save_draft', {
      p_kind: kind,
      p_key: doc.key,
      p_data: { ...doc.draft.data, sortOrder: order },
      p_expected_version: doc.draft.version,
    })
    if (error) return dbFailure(error, 'The order could not be saved. Please try again.')
    if (cleanBefore) {
      const result = await publishVersion(supabase, kind, doc.key, version as number)
      if (!result.ok) return result
    } else if (doc.published) {
      pendingOnly += 1
    }
  }
  return {
    ok: true,
    message: pendingOnly
      ? 'Order saved. Items with unpublished edits get their new position when you publish them.'
      : 'Order saved and live.',
  }
}
