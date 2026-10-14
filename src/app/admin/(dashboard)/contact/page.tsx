import type { Metadata } from 'next'
import { ContactForm } from '@/components/admin/ContactForm'
import { formatTimestamp } from '@/components/admin/StatusBadge'
import { requireAdmin } from '@/lib/cms/admin'
import { readContactState } from '@/lib/cms/drafts'

export const metadata: Metadata = { title: 'Contact & social' }

export default async function ContactEditorPage() {
  const { supabase } = await requireAdmin()
  const contact = await readContactState(supabase)

  return (
    <>
      <h1 className="font-serif text-4xl text-charcoal">Contact &amp; social</h1>
      <p className="mt-2 text-sm font-light text-bronze-dark">
        Used on the Contact page and in the footer of every page. Last published {formatTimestamp(contact.publishedAt)}.
        {contact.hasUnpublishedChanges && (
          <strong className="font-semibold text-amber-900"> You have unpublished changes.</strong>
        )}
      </p>
      <div className="mt-8">
        <ContactForm contact={contact.value} />
      </div>
    </>
  )
}
