import type { ReactNode } from 'react'
import { FaqAccordion, type FaqEntry } from '@/components/faq/FaqAccordion'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'

type FaqSectionProps = {
  items: FaqEntry[]
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
}

export function FAQ({ items, eyebrow, title, intro, viewAllHref, viewAllLabel, className }: FaqSectionProps) {
  return (
    <section id="faq" className={cn('bg-ivory py-20 lg:py-28', className)}>
      <Container>
        <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.4fr]">
          <Reveal stagger>
            {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}
            <SectionTitle className="text-charcoal">{title}</SectionTitle>
            {intro && (
              <p className="mt-6 max-w-xs text-sm font-light leading-relaxed text-bronze-dark">
                {intro}
              </p>
            )}
            {viewAllHref && viewAllLabel && (
              <ArrowLink href={viewAllHref} className="mt-8">
                {viewAllLabel}
              </ArrowLink>
            )}
          </Reveal>

          <Reveal delay={90}>
            <FaqAccordion items={items} />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
