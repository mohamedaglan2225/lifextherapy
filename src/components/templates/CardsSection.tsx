import type { ImageValue, LinkValue } from '@/lib/cms/fields'
import { CmsImage } from '@/components/cms/CmsImage'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'
import { SectionIntro } from './SectionIntro'
import { GRID_COLUMNS, theme } from './theme'

export type CardsData = {
  background: string
  eyebrow: string
  title: string
  intro: string
  columns: string
  items: Array<{ image: ImageValue; title: string; body: string; link: LinkValue }>
}

export function CardsSection({ data }: { data: CardsData }) {
  const colors = theme(data.background)
  return (
    <section className={cn('py-20 lg:py-28', colors.section)}>
      <Container>
        <SectionIntro background={data.background} eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
        <ul className={cn('grid grid-cols-1 gap-6', GRID_COLUMNS[data.columns] ?? GRID_COLUMNS['3'])}>
          {data.items.map((card, index) => (
            <Reveal as="li" key={index} delay={(index % 4) * 80} className="flex">
              <article className={cn('flex w-full flex-col overflow-hidden rounded-sm border', colors.card)}>
                {card.image.src && (
                  <div className="relative aspect-4/3 overflow-hidden bg-ivory-dark">
                    <CmsImage
                      src={card.image.src}
                      alt={card.image.alt}
                      fill
                      loading="lazy"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      data-settle
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className={cn('font-serif text-xl', colors.heading)}>{card.title}</h3>
                  {card.body && (
                    <p className={cn('mt-2 flex-1 whitespace-pre-line text-sm font-light leading-relaxed', colors.body)}>
                      {card.body}
                    </p>
                  )}
                  {card.link.label && (
                    <ArrowLink href={card.link.href} className="mt-6 self-start">
                      {card.link.label}
                    </ArrowLink>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
