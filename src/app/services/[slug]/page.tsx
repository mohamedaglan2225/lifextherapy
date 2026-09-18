import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRelatedServices, getService, services } from '@/data/services'
import { sessionFaqs } from '@/data/content'
import { routes } from '@/config/site'
import { ServiceHero } from '@/components/services/ServiceHero'
import { ServiceEditorial } from '@/components/services/ServiceEditorial'
import { ServiceFocus } from '@/components/services/ServiceFocus'
import { SessionPricing } from '@/components/services/SessionPricing'
import { RelatedServices } from '@/components/services/RelatedServices'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTA } from '@/components/sections/FinalCTA'

type ServicePageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)

  if (!service) return {}

  const url = routes.service(service.slug)

  return {
    title: service.name,
    description: service.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${service.name} | Life X Therapy`,
      description: service.metaDescription,
      url,
    },
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const service = getService(slug)

  if (!service) notFound()

  return (
    <>
      <ServiceHero service={service} />
      <ServiceEditorial service={service} />
      <ServiceFocus service={service} />
      <SessionPricing service={service} />
      <RelatedServices services={getRelatedServices(service.slug)} />
      <FAQ
        items={sessionFaqs}
        eyebrow="Good to know"
        title={
          <>
            Before You
            <br />
            Book
          </>
        }
        intro="A few things worth knowing ahead of your appointment."
        viewAllHref={routes.faq}
      />
      <FinalCTA />
    </>
  )
}
