import type { ReactNode } from 'react'
import { services as allServices, type Service } from '@/data/services'
import { ServiceCard } from '@/components/services/ServiceCard'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'

type ServicesSectionProps = {
  items?: Service[]
  eyebrow?: string
  title?: ReactNode
  intro?: ReactNode
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
}

export function ServicesSection({
  items = allServices,
  eyebrow,
  title,
  intro,
  viewAllHref,
  viewAllLabel = 'View All Services',
  className,
}: ServicesSectionProps) {
  const columns = items.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'

  return (
    <section id="services" className={cn('bg-ivory py-20 lg:py-28', className)}>
      <Container>
        {title && (
          <Reveal stagger className="mb-14 max-w-xl">
            {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
            <SectionTitle className="mb-4 text-charcoal">{title}</SectionTitle>
            {intro && (
              <p className="text-base font-light leading-relaxed text-bronze-dark">{intro}</p>
            )}
          </Reveal>
        )}

        <ul className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2', columns)}>
          {items.map((service, index) => (
            <Reveal as="li" key={service.slug} delay={(index % 3) * 90} className="flex">
              <div className="flex w-full">
                <ServiceCard service={service} />
              </div>
            </Reveal>
          ))}
        </ul>

        {viewAllHref && (
          <Reveal className="mt-12">
            <ArrowLink href={viewAllHref}>{viewAllLabel}</ArrowLink>
          </Reveal>
        )}
      </Container>
    </section>
  )
}
