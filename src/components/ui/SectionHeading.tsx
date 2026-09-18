import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-[10px] font-medium uppercase tracking-[0.25em] text-bronze', className)}>
      {children}
    </p>
  )
}

export function SectionTitle({
  children,
  className,
  as: Tag = 'h2',
}: {
  children: ReactNode
  className?: string
  as?: 'h2' | 'h3'
}) {
  return (
    <Tag className={cn('font-serif text-4xl leading-tight lg:text-5xl', className)}>{children}</Tag>
  )
}
