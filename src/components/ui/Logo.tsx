import { CmsImage } from '@/components/cms/CmsImage'
import { cn } from '@/lib/cn'

export type LogoValue = { src: string; alt: string; width?: number; height?: number }

/**
 * Site logo from Settings. The bundled default is `logo-mark.png` (the supplied
 * mark with a transparent background). Height is set by the caller; width
 * follows the image's aspect ratio.
 */
export function Logo({
  logo,
  className,
  sizes,
  priority,
}: {
  logo: LogoValue
  className?: string
  /** Rendered width, so the browser picks a suitably small source. */
  sizes: string
  priority?: boolean
}) {
  return (
    <CmsImage
      src={logo.src}
      alt={logo.alt}
      width={logo.width ?? 499}
      height={logo.height ?? 505}
      sizes={sizes}
      priority={priority}
      className={cn('w-auto', className)}
    />
  )
}
