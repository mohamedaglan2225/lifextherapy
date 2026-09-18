import Image from 'next/image'
import { routes, siteConfig } from '@/config/site'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export function PhilosophySection() {
  return (
    <section className="bg-ivory-dark py-20 lg:py-28">
      <Container>
        <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-border">
              <Image
                src="/images/philosophy.jpg"
                alt="Calm massage therapy environment"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute -bottom-6 -right-6 hidden h-24 w-24 rounded-sm border border-bronze lg:block"
            />
          </div>

          <div className="lg:pl-8">
            <Eyebrow className="mb-6">Our Philosophy</Eyebrow>
            <SectionTitle className="mb-6 text-charcoal">
              Every Body
              <br />
              <em>Is Different</em>
            </SectionTitle>
            <p className="mb-6 text-base font-light leading-relaxed text-bronze-dark">
              Your session should reflect how your body feels today. {siteConfig.name} offers
              personalized bodywork based on your comfort, goals, and preferences.
            </p>
            <p className="mb-10 text-base font-light leading-relaxed text-bronze-dark">
              Whether you&rsquo;re managing chronic tension, recovering from activity, navigating
              pregnancy, or simply seeking rest &mdash; the work is shaped around you.
            </p>
            <ArrowLink href={routes.about}>Discover {siteConfig.name}</ArrowLink>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
