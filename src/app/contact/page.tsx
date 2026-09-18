import type { Metadata } from 'next'
import { routes } from '@/config/site'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContactSection } from '@/components/sections/ContactSection'
import { FinalCTA } from '@/components/sections/FinalCTA'

const description =
  'Get in touch with Life X Therapy — phone, email, address, business hours, and online booking through Vagaro.'

export const metadata: Metadata = {
  title: 'Contact',
  description,
  alternates: { canonical: routes.contact },
  openGraph: {
    title: 'Contact | Life X Therapy',
    description,
    url: routes.contact,
  },
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in Touch"
        title="Contact"
        intro="Questions before you book, or prefer to talk it through first? Reach out and we’ll get back to you."
        breadcrumbs={[{ label: 'Home', href: routes.home }, { label: 'Contact' }]}
      />
      <ContactSection />
      <FinalCTA />
    </>
  )
}
