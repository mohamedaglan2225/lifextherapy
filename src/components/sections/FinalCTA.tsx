import type { ButtonValue, ImageValue } from '@/lib/cms/fields'
import { CmsButton } from '@/components/cms/CmsButton'
import { CmsImage } from '@/components/cms/CmsImage'
import { Display } from '@/components/cms/Display'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow } from '@/components/ui/SectionHeading'

export type CtaData = {
  image: ImageValue
  eyebrow: string
  title: string
  body: string
  button: ButtonValue
}

export function FinalCTA({ data }: { data: CtaData }) {
  return (
    <section className="relative overflow-hidden py-24 lg:py-36">
      <div className="absolute inset-0">
        <CmsImage
          src={data.image.src}
          alt=""
          aria-hidden="true"
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/80" />
      </div>

      <Reveal stagger className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-10">
        {data.eyebrow && <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>}
        <h2 className="mb-6 font-serif text-5xl leading-tight text-offwhite lg:text-6xl">
          <Display text={data.title} />
        </h2>
        {data.body && (
          <p className="mx-auto mb-10 max-w-xl text-base font-light leading-relaxed text-border lg:text-lg">
            {data.body}
          </p>
        )}
        <CmsButton button={data.button} size="lg" />
      </Reveal>
    </section>
  )
}
