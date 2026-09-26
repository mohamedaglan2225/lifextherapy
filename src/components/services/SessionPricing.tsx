import type { Service } from '@/data/services'
import { formatPrice } from '@/data/services'
import { BookingLink } from '@/components/ui/BookingLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export function SessionPricing({ service }: { service: Service }) {
  return (
    <section className="bg-ivory py-20 lg:py-28">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal stagger>
            <Eyebrow className="mb-4">Session Options</Eyebrow>
            <SectionTitle className="text-charcoal">
              Lengths &amp;
              <br />
              Pricing
            </SectionTitle>
            <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-bronze-dark">
              Every length covers the same treatment. Longer sessions simply allow more time across
              more of the body.
            </p>
          </Reveal>

          <Reveal delay={90}>
            <ul className="border-t border-border">
              {service.sessions.map((session) => (
                <li
                  key={session.minutes}
                  className="flex items-baseline justify-between gap-4 border-b border-border py-5"
                >
                  <span className="text-base text-charcoal">{session.minutes} minutes</span>
                  <span className="font-serif text-xl text-charcoal">
                    {formatPrice(session.price)}
                  </span>
                </li>
              ))}
            </ul>
            <BookingLink
              className="mt-8"
              service={service.slug}
              label={`Book ${service.name} — continues to Vagaro`}
            >
              Book {service.shortName}
            </BookingLink>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
