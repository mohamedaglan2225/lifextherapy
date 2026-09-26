import { benefits } from '@/data/content'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { siteConfig } from '@/config/site'

export function BenefitsSection() {
  return (
    <section className="bg-offwhite py-20 lg:py-28">
      <Container>
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <Reveal stagger>
            <Eyebrow className="mb-6">Why Choose Us</Eyebrow>
            <SectionTitle className="text-charcoal">
              Why Choose
              <br />
              {siteConfig.name}
            </SectionTitle>
            <div aria-hidden="true" className="mt-8 h-px w-12 bg-bronze" />
          </Reveal>

          <ul className="flex flex-col gap-8">
            {benefits.map((benefit, index) => (
              <Reveal as="li" key={benefit.title} delay={index * 70} className="flex items-start gap-5">
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
