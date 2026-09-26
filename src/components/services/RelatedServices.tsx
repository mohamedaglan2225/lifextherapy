import Image from 'next/image'
import Link from 'next/link'
import type { Service } from '@/data/services'
import { formatPrice, startingPrice } from '@/data/services'
import { routes } from '@/config/site'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export function RelatedServices({
  services,
  eyebrow = 'Keep Exploring',
  title = 'Explore Other Services',
}: {
  services: Service[]
  eyebrow?: string
  title?: string
}) {
  if (services.length === 0) return null

  return (
    <section className="bg-offwhite py-20 lg:py-28">
      <Container>
        <Reveal stagger className="mb-12">
          <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
          <SectionTitle className="text-charcoal">{title}</SectionTitle>
        </Reveal>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal as="li" key={service.slug} delay={index * 80}>
              <Link
                href={routes.service(service.slug)}
                className="group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-ivory transition-premium duration-[var(--lx-normal)] hover:border-bronze hover:shadow-[0_20px_44px_-28px_rgba(29,27,25,0.45)] motion-safe:hover:-translate-y-1"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-ivory-dark">
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    data-settle
                    className="object-cover transition-premium duration-500 motion-safe:group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-xl text-charcoal">{service.name}</h3>
                  <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-bronze-dark">
                    From {formatPrice(startingPrice(service))} &middot; {service.sessions[0].minutes}
                    &ndash;{service.sessions[service.sessions.length - 1].minutes} min
                  </p>
                  <span className="mt-6 inline-flex items-center gap-3 text-sm font-medium tracking-wide text-bronze">
                    View Service
                    <span
                      aria-hidden="true"
                      className="h-px w-8 origin-left bg-bronze transition-premium duration-[var(--lx-normal)] group-hover:translate-x-1 group-hover:scale-x-150"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
