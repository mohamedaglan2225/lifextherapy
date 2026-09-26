import Image from 'next/image'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/cn'

/**
 * Official Life X Therapy logo. `logo-mark.png` is the supplied `Logo.png`
 * trimmed to the mark with its flat grey background made transparent.
 * Height is set by the caller; width follows the image's aspect ratio.
 */
export function Logo({
  className,
  sizes,
  priority,
}: {
  className?: string
  /** Rendered width, so the browser picks a suitably small source. */
  sizes: string
  priority?: boolean
}) {
  return (
    <Image
      src="/images/logo-mark.png"
      alt={siteConfig.name}
      width={499}
      height={505}
      sizes={sizes}
      priority={priority}
      className={cn('w-auto', className)}
    />
  )
}
