import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GuardedLink } from '@/components/admin/DirtyGuard'
import { ServiceEditor } from '@/components/admin/ServiceEditor'
import { PageTitle } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import { UUID_PATTERN, type ServiceDoc } from '@/lib/cms/documents'
import { loadEditor } from '@/lib/cms/editor-data'

export const metadata: Metadata = { title: 'Edit service' }

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_PATTERN.test(id)) notFound()
  const { supabase } = await requireAdmin()
  const editor = await loadEditor(supabase, 'service', id)
  if (!editor) notFound()

  return (
    <>
      <GuardedLink href="/admin/services" className="text-xs font-semibold text-bronze underline underline-offset-4">
        ← All services
      </GuardedLink>
      <div className="mt-3">
        <PageTitle title={(editor.props.initialData as unknown as ServiceDoc).name} />
      </div>
      <ServiceEditor props={editor.props} options={editor.options} />
    </>
  )
}
