import type { ReactNode } from 'react'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { Container } from './Container'
import { Enter } from './Enter'
import { Eyebrow } from './SectionHeading'
import { cn } from '@/lib/cn'

/**
 * Shared top-of-page block. Carries enough top padding to clear the fixed
 * header and staggers its own entrance on mount.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  actions,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  breadcrumbs?: Crumb[]
  actions?: ReactNode
  className?: string
}) {
  return (
    <section className={cn('bg-ivory pt-28 pb-14 lg:pt-40 lg:pb-20', className)}>
      <Container>
        {breadcrumbs && (
          <Enter className="mb-8" delay={0}>
            <Breadcrumbs items={breadcrumbs} />
          </Enter>
        )}
        <div className="max-w-2xl">
          {eyebrow && (
            <Enter delay={breadcrumbs ? 60 : 0}>
              <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
            </Enter>
          )}
          <Enter delay={breadcrumbs ? 120 : 60}>
            <h1 className="font-serif text-4xl leading-tight text-charcoal sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          </Enter>
          {intro && (
            <Enter delay={breadcrumbs ? 180 : 120}>
              <p className="mt-6 text-base font-light leading-relaxed text-bronze-dark lg:text-lg">
                {intro}
              </p>
            </Enter>
          )}
          {actions && (
            <Enter delay={breadcrumbs ? 240 : 180}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">{actions}</div>
            </Enter>
          )}
        </div>
      </Container>
    </section>
  )
}
