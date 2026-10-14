import type { ButtonValue, ImageValue } from '@/lib/cms/fields'
import { CmsButton } from '@/components/cms/CmsButton'
import { CmsImage } from '@/components/cms/CmsImage'
import { Display } from '@/components/cms/Display'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { theme } from './theme'

export type ImageTextData = {
  background: string
  imagePosition: 'left' | 'right'
  image: ImageValue
  eyebrow: string
  title: string
  paragraphs: string[]
  button: ButtonValue
}

export function ImageTextSection({ data }: { data: ImageTextData }) {
  const colors = theme(data.background)
  const hasImage = Boolean(data.image.src)

  return (
    <section className={cn('py-20 lg:py-28', colors.section)}>
      <Container>
        <Reveal className={cn('grid items-center gap-12 lg:gap-20', hasImage ? 'lg:grid-cols-2' : 'max-w-2xl')}>
          {hasImage && (
            <div className={cn('relative aspect-4/3 overflow-hidden rounded-sm bg-border', data.imagePosition === 'right' && 'lg:order-2')}>
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
          )}
          <div>
            {data.eyebrow && <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>}
            <SectionTitle className={cn('mb-6', colors.heading)}>
              <Display text={data.title} />
            </SectionTitle>
            {data.paragraphs.map((paragraph, index) => (
              <p key={index} className={cn('mb-4 whitespace-pre-line text-base font-light leading-relaxed last:mb-0', colors.body)}>
                {paragraph}
              </p>
            ))}
            {data.button.label && (
              <div className="mt-10">
                <CmsButton button={data.button} />
              </div>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
