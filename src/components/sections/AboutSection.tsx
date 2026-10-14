import type { LinkValue } from '@/lib/cms/fields'
import { Display } from '@/components/cms/Display'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export type AboutTeaserData = {
  eyebrow: string
  title: string
  paragraphs: string[]
  link: LinkValue
}

/** Short About preview used on the home page. The full story lives on /about. */
export function AboutSection({ data }: { data: AboutTeaserData }) {
  return (
    <section className="bg-ivory-dark py-20 lg:py-28">
      <Container>
        <Reveal className="grid gap-8 lg:grid-cols-2 lg:gap-20">
          <div>
            {data.eyebrow && <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>}
            <SectionTitle className="text-charcoal">
              <Display text={data.title} />
            </SectionTitle>
          </div>

          <div className="lg:pt-10">
            {data.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === data.paragraphs.length - 1
                    ? 'mb-10 text-base font-light leading-relaxed text-bronze-dark'
                    : 'mb-4 text-base font-light leading-relaxed text-bronze-dark'
                }
              >
                {paragraph}
              </p>
            ))}
            {data.link.label && (
              <ArrowLink href={data.link.href} aria-label={data.link.ariaLabel || undefined}>
                {data.link.label}
              </ArrowLink>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
