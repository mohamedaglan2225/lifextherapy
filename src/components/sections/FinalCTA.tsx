import Image from 'next/image'
import { BookingLink } from '@/components/ui/BookingLink'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/SectionHeading'

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-36">
      <div className="absolute inset-0">
        <Image
          src="/images/booking-cta.jpg"
          alt=""
          aria-hidden="true"
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/80" />
      </div>

      <Reveal stagger className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-10">
        <Eyebrow className="mb-6">Ready to Begin</Eyebrow>
        <h2 className="mb-6 font-serif text-5xl leading-tight text-offwhite lg:text-6xl">
          Ready to Feel Better?
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-base font-light leading-relaxed text-border lg:text-lg">
          Choose the massage and session length that works for you and book your appointment online.
        </p>
        <BookingLink size="lg">Book Your Session</BookingLink>
      </Reveal>
    </section>
  )
}
