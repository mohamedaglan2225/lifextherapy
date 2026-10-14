import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'

export type TrustBarData = {
  label: string
  items: Array<{ icon: IconName; title: string; detail: string }>
}

export function TrustBar({ data }: { data: TrustBarData }) {
  return (
    <section aria-label={data.label} className="bg-charcoal py-12 lg:py-16">
      <Container>
        <ul className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-6">
          {data.items.map((item, index) => (
            <Reveal
              as="li"
              key={`${index}-${item.title}`}
              delay={index * 70}
              className="flex flex-col items-start gap-3"
            >
              <span className="text-bronze">
                <Icon name={item.icon} size={22} />
              </span>
              <span>
                <span className="block text-sm font-semibold tracking-wide text-offwhite">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs font-light leading-relaxed text-bronze">
                  {item.detail}
                </span>
              </span>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
