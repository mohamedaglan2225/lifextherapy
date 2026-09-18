import { bookingSteps } from '@/data/content'
import { BookingLink } from '@/components/ui/BookingLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export function BookingSteps() {
  return (
    <section className="bg-offwhite py-20 lg:py-28">
      <Container>
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <Eyebrow className="mb-4">How It Works</Eyebrow>
          <SectionTitle className="text-charcoal">Book Your Session</SectionTitle>
        </Reveal>

        <ol className="relative grid gap-8 md:grid-cols-3 lg:gap-12">
          <div
            aria-hidden="true"
            className="absolute left-[16.67%] right-[16.67%] top-8 hidden h-px bg-border md:block"
          />
          {bookingSteps.map((step, index) => (
            <Reveal
              as="li"
              key={step.number}
              delay={index * 90}
              className="relative flex flex-col items-center text-center"
            >
              <span className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-ivory">
                <span className="font-serif text-lg text-bronze">{step.number}</span>
              </span>
              <h3 className="mb-2 text-base font-semibold text-charcoal">{step.title}</h3>
              <p className="max-w-xs text-sm font-light leading-relaxed text-bronze-dark">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-12 text-center">
          <BookingLink>Book Now</BookingLink>
        </Reveal>
      </Container>
    </section>
  )
}
