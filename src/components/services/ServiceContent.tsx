import type { ServiceItem } from '@/lib/cms/published'
import { ServiceHero } from './ServiceHero'
import { ServiceEditorial } from './ServiceEditorial'
import { ServiceFocus } from './ServiceFocus'
import { SessionPricing } from './SessionPricing'
import { RelatedServices } from './RelatedServices'

export type ServiceContentData = {
  bookingLegend: string
  bookingButton: string
  bookingNote: string
  aboutEyebrow: string
  aboutTitle: string
  expectEyebrow: string
  expectTitle: string
  focusEyebrow: string
  focusTitle: string
  suitabilityEyebrow: string
  suitabilityTitle: string
  suitabilityNote: string
  pricingEyebrow: string
  pricingTitle: string
  pricingIntro: string
  relatedEyebrow: string
  relatedTitle: string
}

/** Next active services in catalog order, wrapping around. Never links to itself. */
function relatedServices(services: ServiceItem[], slug: string, count = 3) {
  const index = services.findIndex((service) => service.slug === slug)
  if (index === -1) return services.slice(0, count)
  return Array.from({ length: Math.min(count, services.length - 1) }, (_, offset) => services[(index + offset + 1) % services.length])
}

/** The fixed body of every service page, driven by the service's own content. */
export function ServiceContent({
  data,
  service,
  services,
  eyebrow,
}: {
  data: ServiceContentData
  service: ServiceItem
  services: ServiceItem[]
  eyebrow: string
}) {
  return (
    <>
      <ServiceHero service={service} eyebrow={eyebrow} labels={data} />
      <ServiceEditorial service={service} labels={data} />
      <ServiceFocus service={service} labels={data} />
      <SessionPricing service={service} labels={data} />
      <RelatedServices services={relatedServices(services, service.slug)} eyebrow={data.relatedEyebrow} title={data.relatedTitle} />
    </>
  )
}
