'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Very mild parallax, used once on the home hero. The transform is written
 * inside a rAF callback so React never re-renders on scroll, and the effect
 * stays completely inert when the visitor prefers reduced motion.
 */
export function ParallaxLayer({
  children,
  className,
  strength = 0.08,
}: {
  children: ReactNode
  className?: string
  strength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0

    const update = () => {
      frame = 0
      // Only travels while the hero is still on screen.
      const distance = Math.min(window.scrollY, window.innerHeight)
      node.style.transform = `translate3d(0, ${(distance * strength).toFixed(1)}px, 0)`
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [strength])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
