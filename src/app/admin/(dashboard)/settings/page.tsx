import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SettingsEditor } from '@/components/admin/SettingsEditor'
import { PageTitle } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import { loadEditor } from '@/lib/cms/editor-data'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const { supabase } = await requireAdmin()
  const editor = await loadEditor(supabase, 'settings', 'site')
  if (!editor) notFound()
  return (
    <>
      <PageTitle title="Settings" description="Brand, contact details, hours, social links, navigation, booking, footer and default search settings. Used on every page." />
      <SettingsEditor props={editor.props} options={editor.options} />
    </>
  )
}
