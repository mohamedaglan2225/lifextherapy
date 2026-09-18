import type { Metadata } from 'next'
import { legalPagesPublished, routes } from '@/config/site'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Life X Therapy.',
  alternates: { canonical: routes.privacy },
  robots: { index: legalPagesPublished, follow: true },
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This page is ready for your privacy policy. The wording below is a placeholder."
    >
      <p>[Privacy policy placeholder — replace with the full policy text.]</p>
      <p>
        [Describe what personal information is collected, how it is used, how long it is kept, who it
        is shared with, and how a client can request access or deletion.]
      </p>
      <p>
        [Note that appointment booking and payment are handled by Vagaro, and link to their privacy
        policy where appropriate.]
      </p>
    </LegalPage>
  )
}
