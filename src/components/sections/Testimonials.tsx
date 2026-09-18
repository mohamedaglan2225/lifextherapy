import { testimonials } from '@/data/content'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export function Testimonials() {
  return (
    <section className="bg-ivory py-20 lg:py-28">
      <Container>
        <Reveal className="mb-14 text-center">
          <Eyebrow className="mb-4">Client Experiences</Eyebrow>
          <SectionTitle className="text-charcoal">What Clients Say</SectionTitle>
        </Reveal>

        <ul className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal
              as="li"
              key={index}
              delay={index * 90}
              className="flex flex-col justify-between rounded-sm border border-border bg-offwhite p-8"
            >
              <div>
                {/* Decorative placeholder rating — no real reviews have been collected yet. */}
                <div aria-hidden="true" className="mb-6 flex gap-1 text-sm text-bronze">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <span key={star}>★</span>
                  ))}
                </div>
                <blockquote className="mb-8 text-base font-light italic leading-relaxed text-bronze-dark">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>
              <div className="border-t border-border pt-5">
                <p className="text-sm font-semibold text-charcoal">&mdash; {testimonial.name}</p>
                <p className="mt-0.5 text-xs font-light tracking-wide text-bronze">
                  {testimonial.service}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
