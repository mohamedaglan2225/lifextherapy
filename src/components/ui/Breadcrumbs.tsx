import Link from 'next/link'
import { cn } from '@/lib/cn'

export type Crumb = {
  label: string
  href?: string
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-light">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-bronze-dark transition-premium duration-[var(--lx-fast)] hover:text-charcoal"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={cn(isLast && 'text-charcoal')}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-border">
                  /
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
