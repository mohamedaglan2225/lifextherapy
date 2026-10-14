import type { ServiceDoc } from '@/lib/cms/documents'
import { CmsImage } from '@/components/cms/CmsImage'
import { Display } from '@/components/cms/Display'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export type ServiceEditorialLabels = { aboutEyebrow: string; aboutTitle: string; expectEyebrow: string; expectTitle: string }

export function ServiceEditorial({ service, labels }: { service: ServiceDoc; labels: ServiceEditorialLabels }) {
  return (
    <section className="bg-offwhite py-20 lg:py-28">
      <Container>
        <Reveal variant="image" className="relative aspect-16/9 overflow-hidden rounded-sm bg-ivory-dark">
          <CmsImage
            src={service.editorialImage.src}
            alt={service.editorialImage.alt}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
          />
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal stagger>
            {labels.aboutEyebrow && <Eyebrow className="mb-4">{labels.aboutEyebrow}</Eyebrow>}
            <SectionTitle className="mb-6 text-3xl text-charcoal lg:text-4xl">
              <Display text={labels.aboutTitle} />
            </SectionTitle>
            {service.about.map((paragraph, index) => (
              <p
                key={index}
                className="mb-4 text-base font-light leading-relaxed text-bronze-dark last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal stagger delay={90}>
            {labels.expectEyebrow && <Eyebrow className="mb-4">{labels.expectEyebrow}</Eyebrow>}
            <SectionTitle className="mb-6 text-3xl text-charcoal lg:text-4xl">
              <Display text={labels.expectTitle} />
            </SectionTitle>
            <ol className="flex flex-col gap-5">
              {service.whatToExpect.map((step, index) => (
                <li key={index} className="flex gap-4">
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
