import type { ServiceDoc } from '@/lib/cms/documents'
import { Display } from '@/components/cms/Display'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export type ServiceFocusLabels = {
  focusEyebrow: string
  focusTitle: string
  suitabilityEyebrow: string
  suitabilityTitle: string
  suitabilityNote: string
}

export function ServiceFocus({ service, labels }: { service: ServiceDoc; labels: ServiceFocusLabels }) {
  return (
    <section className="bg-ivory-dark py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal stagger>
              {labels.focusEyebrow && <Eyebrow className="mb-4">{labels.focusEyebrow}</Eyebrow>}
              <SectionTitle className="mb-10 text-3xl text-charcoal lg:text-4xl">
                <Display text={labels.focusTitle} />
              </SectionTitle>
            </Reveal>
            <ul className="flex flex-col gap-8">
              {service.focusAreas.map((area, index) => (
                <Reveal as="li" key={`${index}-${area.title}`} delay={index * 80} className="flex gap-5">
                  <span aria-hidden="true" className="mt-2.5 h-px w-8 shrink-0 bg-bronze" />
                  <span>
                    <h3 className="mb-1 text-base font-semibold text-charcoal">{area.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-bronze-dark">{area.body}</p>
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal delay={120}>
            <div className="rounded-sm border border-border bg-offwhite p-8 lg:p-10">
              {labels.suitabilityEyebrow && <Eyebrow className="mb-4">{labels.suitabilityEyebrow}</Eyebrow>}
              <h2 className="mb-8 font-serif text-2xl leading-tight text-charcoal lg:text-3xl">
                {labels.suitabilityTitle}
              </h2>
              <ul className="flex flex-col gap-4">
                {service.suitableFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-bronze"
                    />
                    <span className="text-sm font-light leading-relaxed text-bronze-dark">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              {labels.suitabilityNote && (
                <p className="mt-8 border-t border-border pt-6 text-xs font-light leading-relaxed text-bronze-dark">
                  {labels.suitabilityNote}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
