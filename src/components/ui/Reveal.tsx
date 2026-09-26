'use client'

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'

export type RevealVariant = 'rise' | 'fade' | 'image'

type RevealProps = {
  children: ReactNode
  className?: string
  variant?: RevealVariant
  /** Stagger offset in milliseconds. */
  delay?: number
  /** Animate direct children one after another instead of as one block. */
  stagger?: boolean
  as?: ElementType
}

/**
 * Reveals a group of content once it scrolls into view. The revealed state is
 * written straight to the DOM attribute the stylesheet reads, so nothing
 * re-renders on scroll. Visuals and the reduced-motion opt-out live in
 * globals.css.
 */
export function Reveal({
  children,
  className,
  variant = 'rise',
  delay = 0,
  stagger = false,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reveal = () => node.setAttribute('data-revealed', 'true')

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      reveal()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal()
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const style = delay ? ({ '--lx-reveal-delay': `${delay}ms` } as CSSProperties) : undefined

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-stagger={stagger || undefined}
      style={style}
      className={className}
    >
      {children}
    </Tag>
  )
}
