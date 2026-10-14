import { Display } from '@/components/cms/Display'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'

export type BenefitsData = {
  eyebrow: string
  title: string
  items: Array<{ icon: IconName; title: string; body: string }>
}

export function BenefitsSection({ data }: { data: BenefitsData }) {
  return (
    <section className="bg-offwhite py-20 lg:py-28">
      <Container>
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <Reveal stagger>
            {data.eyebrow && <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>}
            <SectionTitle className="text-charcoal">
              <Display text={data.title} />
            </SectionTitle>
            <div aria-hidden="true" className="mt-8 h-px w-12 bg-bronze" />
          </Reveal>

          <ul className="flex flex-col gap-8">
            {data.items.map((benefit, index) => (
              <Reveal as="li" key={`${index}-${benefit.title}`} delay={index * 70} className="flex items-start gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border text-bronze">
                  <Icon name={benefit.icon} size={24} strokeWidth={1.4} />
                </span>
                <span>
                  <h3 className="mb-1 text-base font-semibold text-charcoal">{benefit.title}</h3>
                  <p className="text-sm font-light leading-relaxed text-bronze-dark">{benefit.body}</p>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
