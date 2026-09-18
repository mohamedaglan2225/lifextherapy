import type { Metadata } from 'next'
import { services } from '@/data/services'
import { routes } from '@/config/site'
import { PageHeader } from '@/components/ui/PageHeader'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { BookingSteps } from '@/components/sections/BookingSteps'
import { FinalCTA } from '@/components/sections/FinalCTA'

export const metadata: Metadata = {
  title: 'Massage Services',
  description:
    'The full Life X Therapy catalog — Swedish, therapeutic, pregnancy, sports, hot stone and deep tissue massage, with session lengths and pricing.',
  alternates: { canonical: routes.services },
  openGraph: {
    title: 'Massage Services | Life X Therapy',
    description:
      'The full Life X Therapy catalog — Swedish, therapeutic, pregnancy, sports, hot stone and deep tissue massage, with session lengths and pricing.',
    url: routes.services,
  },
}

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Services"
        title="Massage & Bodywork Services"
        intro="Choose the session that best fits your body, goals, and schedule. Every treatment is available in more than one length — pick the massage first, then the time you have."
        breadcrumbs={[{ label: 'Home', href: routes.home }, { label: 'Services' }]}
      />
      <ServicesSection items={services} className="pt-0" />
      <BookingSteps />
      <FinalCTA />
    </>
  )
}
