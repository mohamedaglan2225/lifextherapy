import type { CSSProperties, ElementType, ReactNode } from 'react'

/**
 * Entrance animation that runs on mount, used for hero and page-header
 * content. Pure CSS, so it stays a server component.
 */
export function Enter({
  children,
  className,
  delay = 0,
  variant,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  variant?: 'settle'
  as?: ElementType
}) {
  return (
    <Tag
      data-enter={variant ?? ''}
      style={{ '--lx-enter-delay': `${delay}ms` } as CSSProperties}
      className={className}
    >
      {children}
    </Tag>
  )
}
