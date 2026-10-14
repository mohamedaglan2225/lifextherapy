import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { signedPreviewUrls } from './admin'
import type { DocKind, ServiceDoc } from './documents'
import { uploadedImagePaths } from './fields'
import { listDocStates, listRevisions, loadDocState } from './repo'

/** Everything a document editor needs, read with the admin's session. */
export async function loadEditor(supabase: SupabaseClient, kind: DocKind, key: string) {
  const state = await loadDocState(supabase, kind, key)
  if (!state?.draft) return null
  const [revisions, services, previews] = await Promise.all([
    listRevisions(supabase, kind, key),
    listDocStates(supabase, 'service'),
    signedPreviewUrls(supabase, uploadedImagePaths(state.draft.data)),
  ])

  return {
    props: {
      kind,
      docKey: key,
      initialData: state.draft.data,
      initialVersion: state.draft.version,
      publishedData: state.published?.data ?? null,
      publishedAt: state.published?.publishedAt ?? null,
      updatedAt: state.draft.updatedAt,
      updatedByEmail: state.draft.updatedByEmail,
      revisions,
    },
    options: {
      services: services
        .map((service) => service.draft?.data as ServiceDoc | undefined)
        .filter((service): service is ServiceDoc => Boolean(service))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((service) => ({ slug: service.slug, name: service.status === 'archived' ? `${service.name} (archived)` : service.name })),
      previews,
    },
  }
}
