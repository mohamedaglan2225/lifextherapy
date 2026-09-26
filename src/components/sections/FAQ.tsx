import type { ReactNode } from 'react'
import { faqs as allFaqs, type Faq } from '@/data/content'
import { FaqAccordion } from '@/components/faq/FaqAccordion'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'

type FaqSectionProps = {
  items?: Faq[]
  eyebrow?: string
  title?: ReactNode
  intro?: ReactNode
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
}

export function FAQ({
  items = allFaqs,
  eyebrow = 'FAQ',
  title = (
    <>
      Questions &amp;
      <br />
      Answers
    </>
  ),
  intro = 'Can’t find what you’re looking for? Reach out directly and we’ll be happy to help.',
  viewAllHref,
  viewAllLabel = 'View All FAQs',
  className,
}: FaqSectionProps) {
  return (
    <section id="faq" className={cn('bg-ivory py-20 lg:py-28', className)}>
      <Container>
        <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.4fr]">
          <Reveal stagger>
            <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
            <SectionTitle className="text-charcoal">{title}</SectionTitle>
            {intro && (
              <p className="mt-6 max-w-xs text-sm font-light leading-relaxed text-bronze-dark">
                {intro}
              </p>
            )}
            {viewAllHref && (
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
