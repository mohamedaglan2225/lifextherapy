import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FaqEditor } from '@/components/admin/FaqEditor'
import { PageTitle } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import { loadEditor } from '@/lib/cms/editor-data'

export const metadata: Metadata = { title: 'FAQs' }

export default async function FaqsPage() {
  const { supabase } = await requireAdmin()
  const editor = await loadEditor(supabase, 'faqs', 'all')
  if (!editor) notFound()
  return (
    <>
      <PageTitle title="FAQs" description="Questions, answers, categories and order. Choose which questions appear on the home page and on service pages." />
      <FaqEditor props={editor.props} options={editor.options} />
    </>
  )
}
