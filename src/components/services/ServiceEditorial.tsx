import Image from 'next/image'
import type { Service } from '@/data/services'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export function ServiceEditorial({ service }: { service: Service }) {
  return (
    <section className="bg-offwhite py-20 lg:py-28">
      <Container>
        <Reveal variant="image" className="relative aspect-16/9 overflow-hidden rounded-sm bg-ivory-dark">
          <Image
            src={service.editorialImage}
            alt={service.editorialImageAlt}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
          />
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal stagger>
            <Eyebrow className="mb-4">About This Massage</Eyebrow>
            <SectionTitle className="mb-6 text-3xl text-charcoal lg:text-4xl">
              What the session is
            </SectionTitle>
            {service.about.map((paragraph) => (
              <p
                key={paragraph}
                className="mb-4 text-base font-light leading-relaxed text-bronze-dark last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal stagger delay={90}>
            <Eyebrow className="mb-4">What To Expect</Eyebrow>
            <SectionTitle className="mb-6 text-3xl text-charcoal lg:text-4xl">
              How it runs
            </SectionTitle>
            <ol className="flex flex-col gap-5">
              {service.whatToExpect.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 font-serif text-sm text-bronze"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-base font-light leading-relaxed text-bronze-dark">{step}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
