import type { ServiceDoc } from '@/lib/cms/documents'
import { routes } from '@/config/site'
import { CmsImage } from '@/components/cms/CmsImage'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Container } from '@/components/ui/Container'
import { Enter } from '@/components/ui/Enter'
import { Eyebrow } from '@/components/ui/SectionHeading'
import { ServiceBooking, type ServiceBookingLabels } from './ServiceBooking'

export function ServiceHero({
  service,
  eyebrow,
  labels,
}: {
  service: ServiceDoc
  eyebrow: string
  labels: ServiceBookingLabels
}) {
  return (
    <section className="bg-ivory pt-28 pb-16 lg:pt-40 lg:pb-24">
      <Container>
        <Enter className="mb-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: routes.home },
              { label: 'Services', href: routes.services },
              { label: service.name },
            ]}
          />
        </Enter>

        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Enter delay={60}>
              <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
            </Enter>
            <Enter delay={120}>
              <h1 className="font-serif text-4xl leading-tight text-charcoal sm:text-5xl lg:text-6xl">
                {service.name}
              </h1>
            </Enter>
            <Enter delay={180}>
              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-bronze-dark lg:text-lg">
                {service.intro}
              </p>
            </Enter>
            <Enter delay={240}>
              <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-bronze-dark">
                {service.description}
              </p>
            </Enter>
          </div>

          <div className="flex flex-col gap-8">
            <Enter variant="settle" delay={160}>
              <div className="relative aspect-4/3 overflow-hidden rounded-sm bg-ivory-dark">
                <CmsImage
                  src={service.image.src}
                  alt={service.image.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Enter>
            <Enter delay={300}>
              <ServiceBooking service={service} labels={labels} />
            </Enter>
          </div>
        </div>
      </Container>
    </section>
  )
}
