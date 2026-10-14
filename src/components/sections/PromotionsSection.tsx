import type { PromotionItem } from '@/lib/cms/published'
import { CmsImage } from '@/components/cms/CmsImage'
import { Display } from '@/components/cms/Display'
import { PromotionExpiry } from './PromotionExpiry'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'

export type PromotionsData = { eyebrow: string; title: string }

/** Live promotions placed on this page. Renders nothing when there are none. */
export function PromotionsSection({ data, promotions }: { data: PromotionsData; promotions: PromotionItem[] }) {
  if (promotions.length === 0) return null
  const single = promotions.length === 1

  return (
    <section aria-label="Current offers" data-promotions className="bg-ivory py-20 lg:py-28">
      <Container>
        <Reveal stagger className="mb-12">
          {data.eyebrow && <Eyebrow className="mb-4">{data.eyebrow}</Eyebrow>}
          <SectionTitle className="max-w-xl text-charcoal">
            <Display text={data.title} />
          </SectionTitle>
        </Reveal>

        <ul className={cn('grid gap-8', single ? 'max-w-4xl' : 'md:grid-cols-2 lg:grid-cols-3')}>
          {promotions.map((promotion, index) => {
            const imageSrc = promotion.image.src
            return (
              <Reveal as="li" key={promotion.id} delay={index * 90}>
                <article
                  data-promotion-ends={promotion.endsAt || undefined}
                  className={cn(
                    'flex h-full flex-col overflow-hidden rounded-sm border border-border bg-offwhite',
                    single && imageSrc && 'md:flex-row',
                  )}
                >
                  {imageSrc && (
                    <div
                      className={cn(
                        'relative aspect-[4/3] shrink-0 overflow-hidden bg-ivory-dark',
                        single && 'md:aspect-auto md:w-1/2',
                      )}
                    >
                      <CmsImage
                        src={imageSrc}
                        alt={promotion.image.alt}
                        fill
                        sizes={single ? '(min-width: 768px) 448px, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
                        data-settle
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6 lg:p-8">
                    <h3 className="mb-3 font-serif text-2xl leading-snug text-charcoal">{promotion.title}</h3>
                    {promotion.description && (
                      <p className="mb-6 flex-1 whitespace-pre-line text-sm font-light leading-relaxed text-bronze-dark">
                        {promotion.description}
                      </p>
                    )}
                    {promotion.link.label && (
                      <ButtonLink href={promotion.link.href} variant="dark" size="compact" className="mt-auto self-start">
                        {promotion.link.label}
                      </ButtonLink>
                    )}
                  </div>
                </article>
              </Reveal>
            )
          })}
        </ul>
      </Container>
      <PromotionExpiry />
    </section>
  )
}
