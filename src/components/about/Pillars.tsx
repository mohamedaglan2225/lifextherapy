import { Display } from '@/components/cms/Display'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export type PillarsData = {
  eyebrow: string
  title: string
  intro: string
  items: Array<{ icon: IconName; title: string; body: string }>
}

export function Pillars({ data }: { data: PillarsData }) {
  return (
    <section className="bg-offwhite py-20 lg:py-28">
      <Container>
        <Reveal stagger className="mb-14 max-w-xl">
          {data.eyebrow && <Eyebrow className="mb-4">{data.eyebrow}</Eyebrow>}
          <SectionTitle className="mb-4 text-charcoal">
            <Display text={data.title} />
          </SectionTitle>
          {data.intro && <p className="text-base font-light leading-relaxed text-bronze-dark">{data.intro}</p>}
        </Reveal>

        <ul className="grid gap-10 sm:grid-cols-2 lg:gap-x-16">
          {data.items.map((pillar, index) => (
            <Reveal as="li" key={`${index}-${pillar.title}`} delay={index * 80} className="flex items-start gap-5">
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
  )
}
