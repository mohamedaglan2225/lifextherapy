import type { Service } from '@/data/services'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export function ServiceFocus({ service }: { service: Service }) {
  return (
    <section className="bg-ivory-dark py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow className="mb-4">Focus Areas</Eyebrow>
              <SectionTitle className="mb-10 text-3xl text-charcoal lg:text-4xl">
                Where the work goes
              </SectionTitle>
            </Reveal>
            <ul className="flex flex-col gap-8">
              {service.focusAreas.map((area, index) => (
                <Reveal as="li" key={area.title} delay={index * 80} className="flex gap-5">
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
              <Eyebrow className="mb-4">Suitability</Eyebrow>
              <h2 className="mb-8 font-serif text-2xl leading-tight text-charcoal lg:text-3xl">
                Who this session may suit
              </h2>
              <ul className="flex flex-col gap-4">
                {service.suitableFor.map((item) => (
                  <li key={item} className="flex items-start gap-3">
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
              <p className="mt-8 border-t border-border pt-6 text-xs font-light leading-relaxed text-bronze-dark">
                Not sure which session is right for you? Your therapist will talk it through with you
                at the start of your appointment.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
