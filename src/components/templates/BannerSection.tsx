import type { ButtonValue } from '@/lib/cms/fields'
import { CmsButton } from '@/components/cms/CmsButton'
import { Display } from '@/components/cms/Display'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { theme } from './theme'

export type BannerData = { background: string; eyebrow: string; title: string; body: string; button: ButtonValue }

export function BannerSection({ data }: { data: BannerData }) {
  const colors = theme(data.background)
  return (
    <section className={cn('py-14 lg:py-16', colors.section)}>
      <Container>
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            {data.eyebrow && <Eyebrow className="mb-3">{data.eyebrow}</Eyebrow>}
            <h2 className={cn('font-serif text-3xl leading-tight lg:text-4xl', colors.heading)}>
              <Display text={data.title} />
            </h2>
            {data.body && <p className={cn('mt-3 text-base font-light leading-relaxed', colors.body)}>{data.body}</p>}
          </div>
          {data.button.label && (
            <div className="shrink-0">
              <CmsButton button={data.button} />
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  )
}
