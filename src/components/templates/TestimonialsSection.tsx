import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'
import { SectionIntro } from './SectionIntro'
import { theme } from './theme'

export type TestimonialsData = {
  background: string
  eyebrow: string
  title: string
  items: Array<{ quote: string; name: string; detail: string }>
}

export function TestimonialsSection({ data }: { data: TestimonialsData }) {
  const colors = theme(data.background)
  return (
    <section className={cn('py-20 lg:py-28', colors.section)}>
      <Container>
        <SectionIntro background={data.background} eyebrow={data.eyebrow} title={data.title} />
        <ul className={cn('grid grid-cols-1 gap-6', data.items.length > 1 && 'md:grid-cols-2', data.items.length > 2 && 'lg:grid-cols-3')}>
          {data.items.map((item, index) => (
            <Reveal as="li" key={index} delay={(index % 3) * 80} className="flex">
              <figure className={cn('flex w-full flex-col rounded-sm border p-8', colors.card)}>
                <span aria-hidden="true" className="font-serif text-5xl leading-none text-bronze">
                  &ldquo;
                </span>
                <blockquote className={cn('mt-2 flex-1 whitespace-pre-line text-base font-light leading-relaxed', colors.body)}>
                  {item.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-border/60 pt-4">
                  <span className={cn('block text-sm font-semibold', colors.heading)}>{item.name}</span>
                  {item.detail && <span className="mt-0.5 block text-xs text-bronze">{item.detail}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
