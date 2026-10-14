import type { FaqsDoc } from '@/lib/cms/documents'
import type { LinkValue } from '@/lib/cms/fields'
import { FaqAccordion } from '@/components/faq/FaqAccordion'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/SectionHeading'

export type FaqListData = { boxTitle: string; boxBody: string; boxLink: LinkValue }

/** Every question grouped by category, in category order, then a contact box. */
export function FaqList({ data, faqs }: { data: FaqListData; faqs: FaqsDoc }) {
  const groups = faqs.categories
    .map((category) => ({ category, items: faqs.items.filter((faq) => faq.category === category) }))
    .filter((group) => group.items.length > 0)
  const showBox = Boolean(data.boxTitle || data.boxBody || data.boxLink.label)

  return (
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

        {showBox && (
          <Reveal className="mt-16 rounded-sm border border-border bg-offwhite p-8 lg:p-10">
            {data.boxTitle && <h2 className="mb-3 font-serif text-2xl text-charcoal">{data.boxTitle}</h2>}
            {data.boxBody && (
              <p className="mb-6 max-w-lg text-sm font-light leading-relaxed text-bronze-dark">{data.boxBody}</p>
            )}
            {data.boxLink.label && <ArrowLink href={data.boxLink.href}>{data.boxLink.label}</ArrowLink>}
          </Reveal>
        )}
      </Container>
    </section>
  )
}
