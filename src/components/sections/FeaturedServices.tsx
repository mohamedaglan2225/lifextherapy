import Image from 'next/image'
import { featuredServices } from '@/data/content'
import { formatPrice, getService, startingPrice } from '@/data/services'
import { routes } from '@/config/site'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'

export function FeaturedServices() {
  return (
    <section className="bg-charcoal py-20 lg:py-28">
      <Container>
        <Reveal stagger className="mb-14">
          <Eyebrow className="mb-4">Signature Experiences</Eyebrow>
          <SectionTitle className="max-w-xl text-offwhite">Bodywork Worth Experiencing</SectionTitle>
        </Reveal>

        <div className="flex flex-col gap-16 lg:gap-24">
          {featuredServices.map((featured, index) => {
            const service = getService(featured.slug)
            if (!service) return null
            const imageFirst = index % 2 === 0

            return (
              <Reveal
                as="article"
                key={featured.slug}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
              >
                <div
                  className={cn(
                    'group relative aspect-4/3 overflow-hidden rounded-sm bg-charcoal-soft',
                    !imageFirst && 'lg:order-2',
                  )}
                >
                  <Image
                    src={featured.image}
                    alt={featured.imageAlt}
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
