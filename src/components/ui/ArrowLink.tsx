import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Text link with the rule that extends on hover. The rule is animated with a
 * transform rather than its width so nothing triggers layout.
 */
export function ArrowLink({
  href,
  children,
  className,
  'aria-label': ariaLabel,
}: {
  href: string
  children: ReactNode
  className?: string
  'aria-label'?: string
}) {
  const classes = cn(
    'group -my-1.5 inline-flex items-center gap-3 py-1.5 text-sm font-medium tracking-wide text-bronze',
    className,
  )

  const content = (
    <>
      {children}
      <span
        aria-hidden="true"
        className="h-px w-8 origin-left bg-bronze transition-premium duration-[var(--lx-normal)] group-hover:translate-x-1 group-hover:scale-x-150"
      />
    </>
  )

  if (href.startsWith('/')) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <a href={href} aria-label={ariaLabel} className={classes}>
      {content}
    </a>
  )
}
