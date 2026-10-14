import type { Metadata } from 'next'
import { legalPagesPublished, routes } from '@/config/site'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of use for Life X Therapy.',
  alternates: { canonical: routes.terms },
  robots: { index: legalPagesPublished, follow: true },
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      intro="This page is ready for your terms of use. The wording below is a placeholder."
    >
      <p>[Terms placeholder — replace with the full terms of use.]</p>
      <p>
        [Cover use of the website, appointment and payment terms, and any policies that apply to
        bookings made through Vagaro.]
      </p>
      <p>
        [No cancellation, rescheduling or refund policy has been supplied yet — add it here and
        update the matching FAQ answer.]
      </p>
    </LegalPage>
  )
}
