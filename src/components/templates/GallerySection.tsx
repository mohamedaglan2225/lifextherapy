import type { ImageValue } from '@/lib/cms/fields'
import { CmsImage } from '@/components/cms/CmsImage'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'
import { SectionIntro } from './SectionIntro'
import { GRID_COLUMNS, theme } from './theme'

export type GalleryData = {
  background: string
  eyebrow: string
  title: string
  intro: string
  columns: string
  images: Array<{ image: ImageValue; caption: string }>
}

export function GallerySection({ data }: { data: GalleryData }) {
  const colors = theme(data.background)
  return (
    <section className={cn('py-20 lg:py-28', colors.section)}>
      <Container>
        <SectionIntro background={data.background} eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
        <ul className={cn('grid grid-cols-1 gap-6', GRID_COLUMNS[data.columns] ?? GRID_COLUMNS['3'])}>
          {data.images.map((item, index) => (
            <Reveal as="li" key={index} delay={(index % 4) * 80}>
              <figure>
                <div className="relative aspect-4/3 overflow-hidden rounded-sm bg-border">
                  <CmsImage
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    data-settle
                    className="object-cover"
                  />
                </div>
                {item.caption && (
                  <figcaption className={cn('mt-3 text-sm font-light', colors.body)}>{item.caption}</figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
