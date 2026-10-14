import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GuardedLink } from '@/components/admin/DirtyGuard'
import { PageEditor } from '@/components/admin/PageEditor'
import { PageTitle } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import { loadEditor } from '@/lib/cms/editor-data'
import { PAGE_DEFS, PAGE_KEYS, type PageKey } from '@/lib/cms/sections'

export const metadata: Metadata = { title: 'Edit page' }

export default async function EditPagePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  if (!(PAGE_KEYS as readonly string[]).includes(key)) notFound()
  const { supabase } = await requireAdmin()
  const editor = await loadEditor(supabase, 'page', key)
  if (!editor) notFound()
  const def = PAGE_DEFS[key as PageKey]

  return (
    <>
      <GuardedLink href="/admin/pages" className="text-xs font-semibold text-bronze underline underline-offset-4">
        ← All pages
      </GuardedLink>
      <div className="mt-3">
        <PageTitle
          title={def.label}
          description={key === 'service' ? 'Headings and sections shared by every service page. Each service’s own text is edited under Services.' : `Address: ${def.path}`}
        />
      </div>
      <PageEditor props={editor.props} options={editor.options} />
    </>
  )
}
