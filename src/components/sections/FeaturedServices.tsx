import type { ImageValue } from '@/lib/cms/fields'
import { formatPrice, startingPrice } from '@/lib/cms/format'
import type { ServiceItem } from '@/lib/cms/published'
import { routes } from '@/config/site'
import { CmsImage } from '@/components/cms/CmsImage'
import { Display } from '@/components/cms/Display'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'

export type FeaturedServicesData = {
  eyebrow: string
  title: string
  items: Array<{ service: string; tagline: string; description: string; image: ImageValue }>
}

export function FeaturedServices({ data, services }: { data: FeaturedServicesData; services: ServiceItem[] }) {
  const items = data.items.flatMap((featured) => {
    const service = services.find((candidate) => candidate.slug === featured.service)
    return service ? [{ featured, service }] : []
  })
  if (items.length === 0) return null

  return (
    <section className="bg-charcoal py-20 lg:py-28">
      <Container>
        <Reveal stagger className="mb-14">
          {data.eyebrow && <Eyebrow className="mb-4">{data.eyebrow}</Eyebrow>}
          <SectionTitle className="max-w-xl text-offwhite">
            <Display text={data.title} />
          </SectionTitle>
        </Reveal>

        <div className="flex flex-col gap-16 lg:gap-24">
          {items.map(({ featured, service }, index) => {
            const imageFirst = index % 2 === 0

            return (
              <Reveal
                as="article"
                key={`${index}-${service.slug}`}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
              >
                <div
                  className={cn(
                    'group relative aspect-4/3 overflow-hidden rounded-sm bg-charcoal-soft',
                    !imageFirst && 'lg:order-2',
                  )}
                >
                  <CmsImage
                    src={featured.image.src}
                    alt={featured.image.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    data-settle
                    className="object-cover transition-premium duration-700 motion-safe:group-hover:scale-[1.04]"
                  />
                </div>

                <div className={cn(!imageFirst && 'lg:order-1')}>
                  <Eyebrow className="mb-4">{featured.tagline}</Eyebrow>
                  <SectionTitle as="h3" className="mb-4 text-3xl text-offwhite lg:text-4xl">
                    {service.name}
                  </SectionTitle>
                  <p className="mb-4 text-sm font-medium text-bronze">
                    From {formatPrice(startingPrice(service))}
                  </p>
                  <p className="mb-8 text-base font-light leading-relaxed text-border">
                    {featured.description}
                  </p>
                  <ArrowLink
                    href={routes.service(service.slug)}
                    aria-label={`Explore ${service.name}`}
                  >
                    Explore {service.shortName}
                  </ArrowLink>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
