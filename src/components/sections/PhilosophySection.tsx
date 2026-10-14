import type { ImageValue, LinkValue } from '@/lib/cms/fields'
import { CmsImage } from '@/components/cms/CmsImage'
import { Display } from '@/components/cms/Display'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export type PhilosophyData = {
  image: ImageValue
  eyebrow: string
  title: string
  paragraphs: string[]
  link: LinkValue
}

export function PhilosophySection({ data }: { data: PhilosophyData }) {
  return (
    <section className="bg-ivory-dark py-20 lg:py-28">
      <Container>
        <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-border">
              <CmsImage
                src={data.image.src}
                alt={data.image.alt}
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 45vw, 100vw"
                data-settle
                className="object-cover"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute -bottom-6 -right-6 hidden h-24 w-24 rounded-sm border border-bronze lg:block"
            />
          </div>

          <div className="lg:pl-8">
            {data.eyebrow && <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>}
            <SectionTitle className="mb-6 text-charcoal">
              <Display text={data.title} />
            </SectionTitle>
            {data.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === data.paragraphs.length - 1
                    ? 'mb-10 text-base font-light leading-relaxed text-bronze-dark'
                    : 'mb-6 text-base font-light leading-relaxed text-bronze-dark'
                }
              >
                {paragraph}
              </p>
            ))}
            {data.link.label && <ArrowLink href={data.link.href}>{data.link.label}</ArrowLink>}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
