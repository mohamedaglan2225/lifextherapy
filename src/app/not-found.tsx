import type { Metadata } from 'next'
import { routes } from '@/config/site'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Container } from '@/components/ui/Container'
import { Enter } from '@/components/ui/Enter'
import { Eyebrow } from '@/components/ui/SectionHeading'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <section className="bg-ivory pt-32 pb-24 lg:pt-44 lg:pb-32">
      <Container>
        <div className="max-w-xl">
          <Enter>
            <Eyebrow className="mb-4">404</Eyebrow>
          </Enter>
          <Enter delay={80}>
            <h1 className="font-serif text-4xl leading-tight text-charcoal sm:text-5xl">
              We couldn&rsquo;t find that page
            </h1>
          </Enter>
          <Enter delay={160}>
            <p className="mt-6 text-base font-light leading-relaxed text-bronze-dark">
              The page you were looking for may have moved. You can browse the full list of massage
              and bodywork services, or head back to the home page.
            </p>
          </Enter>
          <Enter delay={240}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={routes.services}>View All Services</ButtonLink>
              <ButtonLink href={routes.home} variant="outlineDark">
                Back to Home
              </ButtonLink>
            </div>
          </Enter>
        </div>
      </Container>
    </section>
  )
}
