import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GuardedLink } from '@/components/admin/DirtyGuard'
import { PromotionEditor } from '@/components/admin/PromotionEditor'
import { PageTitle } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import { UUID_PATTERN, type PageDoc, type PromotionDoc } from '@/lib/cms/documents'
import { loadEditor } from '@/lib/cms/editor-data'
import { SCHEDULE_REFRESH_SECONDS } from '@/lib/cms/published'
import { listDocStates } from '@/lib/cms/repo'
import type { PageKey } from '@/lib/cms/sections'

export const metadata: Metadata = { title: 'Edit promotion' }

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_PATTERN.test(id)) notFound()
  const { supabase } = await requireAdmin()
  const [editor, pages] = await Promise.all([loadEditor(supabase, 'promotion', id), listDocStates(supabase, 'page')])
  if (!editor) notFound()
  // Pages whose published version has a visible Promotions section.
  const pagesWithSlot = pages
    .filter((page) => ((page.published?.data ?? page.draft?.data) as unknown as PageDoc).sections.some((section) => section.type === 'promotions' && !section.hidden))
    .map((page) => page.key as PageKey)

  return (
    <>
      <GuardedLink href="/admin/promotions" className="text-xs font-semibold text-bronze underline underline-offset-4">
        ← All promotions
      </GuardedLink>
      <div className="mt-3">
        <PageTitle title={(editor.props.initialData as unknown as PromotionDoc).title} />
      </div>
      <PromotionEditor props={editor.props} options={editor.options} pagesWithSlot={pagesWithSlot} refreshMinutes={Math.ceil(SCHEDULE_REFRESH_SECONDS / 60)} />
    </>
  )
}
