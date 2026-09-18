import { routes, siteConfig } from '@/config/site'
import { TherapistCard } from '@/components/about/TherapistCard'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

/** Short About preview used on the home page. The full story lives on /about. */
export function AboutSection() {
  return (
    <section className="bg-ivory-dark py-20 lg:py-28">
      <Container>
        <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow className="mb-6">About</Eyebrow>
            <SectionTitle className="mb-6 text-charcoal">
              Bodywork
              <br />
              <em>With Intention</em>
            </SectionTitle>
            <p className="mb-4 text-base font-light leading-relaxed text-bronze-dark">
              {siteConfig.name} is built around one idea: the session should fit the person on the
              table. Every appointment starts with a conversation and is adjusted as it goes.
            </p>
            <p className="mb-10 text-base font-light leading-relaxed text-bronze-dark">
              [Professional bio placeholder &mdash; share your background, training, approach, and
              what brought you to massage therapy.]
            </p>
            <ArrowLink href={routes.about} aria-label={`Learn about ${siteConfig.name}`}>
              Learn About {siteConfig.name}
            </ArrowLink>
          </div>

          <TherapistCard />
        </Reveal>
      </Container>
    </section>
  )
}
