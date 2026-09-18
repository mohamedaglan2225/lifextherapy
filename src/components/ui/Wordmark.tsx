import { siteConfig } from '@/config/site'
import { cn } from '@/lib/cn'

/**
 * The approved design renders the brand as a typographic wordmark
 * (DM Serif Display) rather than an image asset.
 */
export function Wordmark({
  tone = 'dark',
  className,
  size = 'md',
}: {
  tone?: 'dark' | 'light'
  className?: string
  size?: 'md' | 'lg'
}) {
  return (
    <span className={cn('flex flex-col leading-tight', className)}>
      <span
        className={cn(
          'font-serif tracking-wide transition-colors duration-300',
          size === 'lg' ? 'text-xl' : 'text-lg lg:text-xl',
          tone === 'light' ? 'text-offwhite' : 'text-charcoal',
        )}
      >
        {siteConfig.name}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-bronze">
        {siteConfig.tagline}
      </span>
    </span>
  )
}
