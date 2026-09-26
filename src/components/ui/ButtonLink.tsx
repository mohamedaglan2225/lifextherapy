import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'dark' | 'outlineLight' | 'outlineDark' | 'outlineBronze'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'compact' | 'block' | 'bar'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-bronze text-ivory hover:bg-bronze-dark',
  dark: 'bg-charcoal text-ivory hover:bg-bronze',
  outlineLight: 'border border-border/60 text-ivory-dark hover:border-border hover:text-offwhite',
  outlineDark: 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory',
  outlineBronze: 'border border-bronze text-bronze hover:bg-bronze hover:text-ivory',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-5 py-2.5 text-sm tracking-wide',
  md: 'px-8 py-4 text-sm tracking-wide',
  lg: 'px-10 py-4 text-sm uppercase tracking-[0.1em]',
  compact: 'px-6 py-3 text-xs uppercase tracking-[0.15em]',
  block: 'w-full px-4 py-3 text-xs uppercase tracking-[0.15em]',
  bar: 'w-full py-3.5 text-sm uppercase tracking-[0.1em]',
}

const base =
  'inline-flex items-center justify-center rounded-sm font-medium transition-premium duration-[var(--lx-fast)] motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]'

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className)

  // Internal routes go through the router; Vagaro and other external links do not.
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  )
}
