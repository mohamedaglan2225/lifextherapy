'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/cms/admin'
import { MEDIA_DRAFT_BUCKET, MEDIA_PUBLIC_BUCKET } from '@/lib/cms/config'
import { schemaFor, type DocKind } from '@/lib/cms/documents'
import { isUploadedImage } from '@/lib/cms/fields'
import { listDocStates, listMedia, type MediaItem } from '@/lib/cms/repo'
import { DOC_KINDS } from '@/lib/cms/documents'
import { sessionEnded, type ActionResult } from './types'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export type RegisterInput = { path: string; originalName: string; alt: string; width: number | null; height: number | null }

/** Records an upload the browser just stored in the private drafts bucket. */
export async function registerMedia(input: RegisterInput): Promise<ActionResult & { item?: MediaItem }> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  if (!isUploadedImage(input.path)) return { ok: false, message: 'That upload has an unexpected name.' }
  const dimension = (value: number | null) => (Number.isInteger(value) && value! > 0 && value! <= 20000 ? value : null)

  const { data: id, error } = await session.supabase.rpc('cms_register_media', {
    p_path: input.path,
    p_original_name: String(input.originalName ?? '').slice(0, 200),
    p_alt: String(input.alt ?? '').slice(0, 200),
    p_width: dimension(input.width),
    p_height: dimension(input.height),
  })
  if (error) {
    // Remove the rejected upload so nothing unregistered lingers.
    await session.supabase.storage.from(MEDIA_DRAFT_BUCKET).remove([input.path])
    return { ok: false, message: error.code === '22023' ? 'Use a JPG, PNG, WebP or AVIF image.' : 'The upload could not be added to the library.' }
  }
  const item = (await listMedia(session.supabase)).find((media) => media.id === id)
  return { ok: true, message: 'Uploaded.', item }
}

export async function listMediaForPicker(): Promise<{ ok: boolean; items: MediaItem[] }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, items: [] }
  return { ok: true, items: await listMedia(session.supabase) }
}

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  if (!uuid.test(id)) return { ok: false, message: 'Unknown image.' }
  const { error } = await session.supabase.rpc('cms_update_media', { p_id: id, p_alt: String(alt ?? '').slice(0, 200) })
  return error ? { ok: false, message: 'The description could not be saved.' } : { ok: true, message: 'Description saved.' }
}

async function removeFiles(supabase: SupabaseClient, path: string) {
  const results = await Promise.all([
    supabase.storage.from(MEDIA_DRAFT_BUCKET).remove([path]),
    supabase.storage.from(MEDIA_PUBLIC_BUCKET).remove([path]),
  ])
  return results.every((result) => !result.error)
}

/** Deletes an unused image. The database refuses if anything still uses it. */
export async function deleteMedia(id: string): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  if (!uuid.test(id)) return { ok: false, message: 'Unknown image.' }
  const { data: path, error } = await session.supabase.rpc('cms_delete_media', { p_id: id })
  if (error) {
    return error.code === '23503'
      ? { ok: false, message: 'This image is still used. Remove it from those pages first.' }
      : { ok: false, message: 'The image could not be deleted. Please try again.' }
  }
  return (await removeFiles(session.supabase, path as string))
    ? { ok: true, message: 'Image deleted.' }
    : { ok: true, message: 'Image removed from the library. Some stored files could not be removed yet; run "Clean up" later.' }
}

type CleanupReport = ActionResult & { publicCopiesRemoved?: number; strayFilesRemoved?: number }

/**
 * Removes public copies no published content uses (the private original stays,
 * so drafts and history keep working), and stray files older than an hour that
 * have no library record (for example an interrupted upload).
 */
export async function cleanupMedia(): Promise<CleanupReport> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  const { supabase } = session

  const { data: unused, error } = await supabase.rpc('cms_unused_public_media')
  if (error) return { ok: false, message: 'Cleanup could not start. Please try again.' }
  let publicCopiesRemoved = 0
  const ids = (unused as Array<{ id: string }>).map((row) => row.id)
  if (ids.length) {
    const { data: marked, error: markError } = await supabase.rpc('cms_mark_media_private', { p_ids: ids })
    if (markError) return { ok: false, message: 'Cleanup could not finish. Please try again.' }
    const paths = (marked as string[] | null) ?? []
    if (paths.length) {
      const { error: removeError } = await supabase.storage.from(MEDIA_PUBLIC_BUCKET).remove(paths)
      if (!removeError) publicCopiesRemoved = paths.length
    }
  }

  const { data: known } = await supabase.from('cms_media').select('path')
  const registered = new Set((known ?? []).map((row) => row.path as string))
  const cutoff = Date.now() - 60 * 60 * 1000
  let strayFilesRemoved = 0
  for (const bucket of [MEDIA_DRAFT_BUCKET, MEDIA_PUBLIC_BUCKET]) {
    const { data: files } = await supabase.storage.from(bucket).list('', { limit: 1000 })
    const stray = (files ?? [])
      .filter((file) => isUploadedImage(file.name) && !registered.has(file.name))
      .filter((file) => !file.created_at || Date.parse(file.created_at) < cutoff)
      .map((file) => file.name)
    if (stray.length && !(await supabase.storage.from(bucket).remove(stray)).error) strayFilesRemoved += stray.length
  }

  return {
    ok: true,
    publicCopiesRemoved,
    strayFilesRemoved,
    message:
      publicCopiesRemoved || strayFilesRemoved
        ? `Removed ${publicCopiesRemoved} unused public cop${publicCopiesRemoved === 1 ? 'y' : 'ies'} and ${strayFilesRemoved} stray file${strayFilesRemoved === 1 ? '' : 's'}.`
        : 'Nothing to clean up.',
  }
}

/** Swaps one image for another in every draft that uses it. The drafts then need publishing. */
export async function replaceMediaInDrafts(oldPath: string, newPath: string): Promise<ActionResult & { updated?: Array<{ kind: DocKind; key: string }> }> {
  const session = await getAdminSession()
  if (!session) return sessionEnded
  const { supabase } = session
  if (!isUploadedImage(oldPath) || !isUploadedImage(newPath) || oldPath === newPath) return { ok: false, message: 'Choose a different image.' }

  const updated: Array<{ kind: DocKind; key: string }> = []
  for (const kind of DOC_KINDS) {
    for (const doc of await listDocStates(supabase, kind)) {
      if (!doc.draft) continue
      const text = JSON.stringify(doc.draft.data)
      if (!text.includes(oldPath)) continue
      const data = JSON.parse(text.split(oldPath).join(newPath))
      if (!schemaFor(kind, doc.key).safeParse(data).success) continue
      const { error } = await supabase.rpc('cms_save_draft', {
        p_kind: kind,
        p_key: doc.key,
        p_data: data,
        p_expected_version: doc.draft.version,
      })
      if (error) return { ok: false, message: 'Some drafts could not be updated. Please try again.', updated }
      updated.push({ kind, key: doc.key })
    }
  }
  return {
    ok: true,
    updated,
    message: updated.length
      ? `Replaced in ${updated.length} draft${updated.length === 1 ? '' : 's'}. Publish them to update the live website.`
      : 'No drafts used that image.',
  }
}
