'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Fades page content in on every route change. Keyed by pathname so the
 * animation — and every scroll reveal inside it — restarts on navigation.
 * Navigation itself is never delayed.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} data-page-transition>
      {children}
    </div>
  )
}
