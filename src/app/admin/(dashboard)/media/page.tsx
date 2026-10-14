import type { Metadata } from 'next'
import { MediaLibrary } from '@/components/admin/MediaLibrary'
import { PageTitle } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import { listMedia } from '@/lib/cms/repo'

export const metadata: Metadata = { title: 'Media library' }

export default async function MediaPage() {
  const { supabase } = await requireAdmin()
  const items = await listMedia(supabase)
  return (
    <>
      <PageTitle
        title="Media library"
        description="Uploaded images stay private until content that uses them is published. JPG, PNG, WebP or AVIF, up to 5 MB each."
      />
      <MediaLibrary initialItems={items} />
    </>
  )
}
