import { Display } from '@/components/cms/Display'
import { Reveal } from '@/components/ui/Reveal'
import { Eyebrow, SectionTitle } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { theme } from './theme'

/** Eyebrow, heading and intro shared by the templates. Renders nothing when all are empty. */
export function SectionIntro({
  background,
  eyebrow,
  title,
  intro,
  className,
}: {
  background: string
  eyebrow?: string
  title?: string
  intro?: string
  className?: string
}) {
  if (!eyebrow && !title && !intro) return null
  const colors = theme(background)
  return (
    <Reveal stagger className={cn('mb-12 max-w-2xl', className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      {title && (
        <SectionTitle className={cn(intro && 'mb-4', colors.heading)}>
          <Display text={title} />
        </SectionTitle>
      )}
      {intro && <p className={cn('text-base font-light leading-relaxed', colors.body)}>{intro}</p>}
    </Reveal>
  )
}
