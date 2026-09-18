import Image from 'next/image'
import { routes } from '@/config/site'
import { BookingLink } from '@/components/ui/BookingLink'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Container } from '@/components/ui/Container'
import { Enter } from '@/components/ui/Enter'
import { ParallaxLayer } from '@/components/ui/ParallaxLayer'

export function Hero() {
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden pb-24 sm:pb-16 lg:pb-24">
      <div className="absolute inset-0 overflow-hidden">
        <ParallaxLayer className="absolute inset-x-0 -top-[10%] h-[120%] will-change-transform">
          <Enter variant="settle" className="relative h-full w-full">
            <Image
              src="/images/hero-massage.jpg"
              alt="Massage therapist working on a client in a warmly lit studio"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </Enter>
        </ParallaxLayer>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/40 to-transparent" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-2xl">
          <Enter delay={80}>
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-border">
              Massage Therapy &amp; Bodywork
            </p>
          </Enter>
          <Enter delay={160}>
            <h1 className="mb-6 font-serif text-5xl leading-[1.05] text-offwhite sm:text-6xl lg:text-7xl">
              Feel Better.
              <br />
              Move Better.
              <br />
              <em>Live Calmer.</em>
            </h1>
          </Enter>
          <Enter delay={260}>
            <p className="mb-10 max-w-md text-base font-light leading-relaxed text-ivory-dark lg:text-lg">
              Personalized massage therapy and bodywork designed to relieve tension, restore
              movement, and help you feel your best.
            </p>
          </Enter>
          <Enter delay={360}>
            <div className="flex flex-col gap-4 sm:flex-row">
              <BookingLink>Book a Session</BookingLink>
              <ButtonLink href={routes.services} variant="outlineLight">
                Explore Services
              </ButtonLink>
            </div>
          </Enter>
        </div>
      </Container>

      <div
        aria-hidden="true"
        className="absolute bottom-8 right-8 hidden flex-col items-center gap-2 opacity-60 lg:right-12 lg:flex"
      >
        <span className="translate-y-4 rotate-90 text-[10px] uppercase tracking-[0.2em] text-border">
          Scroll
        </span>
        <div data-scroll-cue className="h-12 w-px bg-border" />
      </div>
    </section>
  )
}
