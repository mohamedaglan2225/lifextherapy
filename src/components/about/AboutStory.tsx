import type { ImageValue } from '@/lib/cms/fields'
import { Display } from '@/components/cms/Display'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { TherapistCard } from './TherapistCard'

export type AboutStoryData = {
  eyebrow: string
  title: string
  paragraphs: string[]
  portrait: ImageValue
  portraitPlaceholder: string
  therapistName: string
  caption: string
}

export function AboutStory({ data }: { data: AboutStoryData }) {
  return (
    <section className="bg-ivory-dark py-20 lg:py-28">
      <Container>
        <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            {data.eyebrow && <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>}
            <SectionTitle className="mb-6 text-charcoal">
              <Display text={data.title} />
            </SectionTitle>
            {data.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === data.paragraphs.length - 1
                    ? 'text-base font-light leading-relaxed text-bronze-dark'
                    : 'mb-4 text-base font-light leading-relaxed text-bronze-dark'
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div>
            <TherapistCard portrait={data.portrait} placeholder={data.portraitPlaceholder} name={data.therapistName} />
            {data.caption && (
              <p className="mt-6 text-xs font-light leading-relaxed text-bronze-dark">{data.caption}</p>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
