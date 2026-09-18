import type { Metadata } from 'next'
import { approachPillars } from '@/data/content'
import { businessPlaceholders, routes, siteConfig } from '@/config/site'
import { TherapistCard } from '@/components/about/TherapistCard'
import { BookingLink } from '@/components/ui/BookingLink'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { FinalCTA } from '@/components/sections/FinalCTA'

const description =
  'Life X Therapy is a massage therapy and bodywork practice built around individualized sessions, comfort-focused care and a calm, unhurried environment.'

export const metadata: Metadata = {
  title: 'About',
  description,
  alternates: { canonical: routes.about },
  openGraph: {
    title: 'About | Life X Therapy',
    description,
    url: routes.about,
  },
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={`About ${siteConfig.name}`}
        intro="A massage therapy and bodywork practice built on individual sessions, comfort-focused care, and a room that feels calm the moment you walk in."
        breadcrumbs={[{ label: 'Home', href: routes.home }, { label: 'About' }]}
        actions={
          <>
            <BookingLink>Book a Session</BookingLink>
            <ButtonLink href={routes.services} variant="outlineDark">
              Explore Services
            </ButtonLink>
          </>
        }
      />

      <section className="bg-ivory-dark py-20 lg:py-28">
        <Container>
          <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <Eyebrow className="mb-6">Our Story</Eyebrow>
              <SectionTitle className="mb-6 text-charcoal">
                Bodywork
                <br />
                <em>With Intention</em>
              </SectionTitle>
              <p className="mb-4 text-base font-light leading-relaxed text-bronze-dark">
                {siteConfig.name} is built around one idea: the session should fit the person on the
                table. Two people can book the same treatment and have it run quite differently,
                because the work follows what the body in front of us is asking for.
              </p>
              <p className="mb-4 text-base font-light leading-relaxed text-bronze-dark">
                [Professional bio placeholder &mdash; share your background, training, approach, and
                what brought you to massage therapy.]
              </p>
              <p className="text-base font-light leading-relaxed text-bronze-dark">
                [Credentials placeholder &mdash; list licences, certifications, training, and
                professional affiliations here.]
              </p>
            </div>

            <div>
              <TherapistCard />
              <p className="mt-6 text-xs font-light leading-relaxed text-bronze-dark">
                {businessPlaceholders.therapistName} &mdash; [role and credentials placeholder]
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-offwhite py-20 lg:py-28">
        <Container>
          <Reveal className="mb-14 max-w-xl">
            <Eyebrow className="mb-4">Our Approach</Eyebrow>
            <SectionTitle className="mb-4 text-charcoal">How we work</SectionTitle>
            <p className="text-base font-light leading-relaxed text-bronze-dark">
              The details that shape every appointment, whichever treatment you book.
            </p>
          </Reveal>

          <ul className="grid gap-10 sm:grid-cols-2 lg:gap-x-16">
            {approachPillars.map((pillar, index) => (
              <Reveal as="li" key={pillar.title} delay={index * 80} className="flex items-start gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border text-bronze">
                  <Icon name={pillar.icon} size={22} strokeWidth={1.4} />
                </span>
                <span>
                  <h3 className="mb-2 text-base font-semibold text-charcoal">{pillar.title}</h3>
                  <p className="text-sm font-light leading-relaxed text-bronze-dark">{pillar.body}</p>
                </span>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <FinalCTA />
    </>
  )
}
