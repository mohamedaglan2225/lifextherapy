import type { Metadata } from 'next'
import { faqsByCategory } from '@/data/content'
import { routes } from '@/config/site'
import { FaqAccordion } from '@/components/faq/FaqAccordion'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/SectionHeading'
import { FinalCTA } from '@/components/sections/FinalCTA'

const description =
  'Answers to common questions about booking, what to expect during your first session, choosing a massage, and session lengths at Life X Therapy.'

export const metadata: Metadata = {
  title: 'FAQ',
  description,
  alternates: { canonical: routes.faq },
  openGraph: {
    title: 'FAQ | Life X Therapy',
    description,
    url: routes.faq,
  },
}

export default function FaqPage() {
  const groups = faqsByCategory()

  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        intro="What to expect, how to choose a session, and how booking works. If your question isn’t here, get in touch and we’ll answer it directly."
        breadcrumbs={[{ label: 'Home', href: routes.home }, { label: 'FAQ' }]}
      />

      <section className="bg-ivory pb-20 lg:pb-28">
        <Container>
          <div className="flex flex-col gap-16">
            {groups.map((group, index) => (
              <Reveal key={group.category} delay={index === 0 ? 0 : 60}>
                <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
                  <div>
                    <Eyebrow className="mb-3">{String(index + 1).padStart(2, '0')}</Eyebrow>
                    <h2 className="font-serif text-2xl leading-tight text-charcoal lg:text-3xl">
                      {group.category}
                    </h2>
                  </div>
                  <FaqAccordion items={group.items} />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 rounded-sm border border-border bg-offwhite p-8 lg:p-10">
            <h2 className="mb-3 font-serif text-2xl text-charcoal">Still have a question?</h2>
            <p className="mb-6 max-w-lg text-sm font-light leading-relaxed text-bronze-dark">
              Reach out before booking and we&rsquo;ll help you choose the treatment and session
              length that fits.
            </p>
            <ArrowLink href={routes.contact}>Contact Life X Therapy</ArrowLink>
          </Reveal>
        </Container>
      </section>

      <FinalCTA />
    </>
  )
}
