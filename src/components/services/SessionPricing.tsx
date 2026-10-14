import type { ServiceDoc } from '@/lib/cms/documents'
import { formatPrice } from '@/lib/cms/format'
import { Display } from '@/components/cms/Display'
import { BookingLink } from '@/components/ui/BookingLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export type SessionPricingLabels = { pricingEyebrow: string; pricingTitle: string; pricingIntro: string }

export function SessionPricing({ service, labels }: { service: ServiceDoc; labels: SessionPricingLabels }) {
  return (
    <section className="bg-ivory py-20 lg:py-28">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal stagger>
            {labels.pricingEyebrow && <Eyebrow className="mb-4">{labels.pricingEyebrow}</Eyebrow>}
            <SectionTitle className="text-charcoal">
              <Display text={labels.pricingTitle} />
            </SectionTitle>
            {labels.pricingIntro && (
              <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-bronze-dark">
                {labels.pricingIntro}
              </p>
            )}
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
