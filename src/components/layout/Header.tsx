'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navLinks, routes, siteConfig } from '@/config/site'
import { BookingLink } from '@/components/ui/BookingLink'
import { Container } from '@/components/ui/Container'
import { Wordmark } from '@/components/ui/Wordmark'
import { MobileNavigation } from './MobileNavigation'
import { cn } from '@/lib/cn'

const MOBILE_NAV_ID = 'mobile-navigation'

/** Only the home page puts a full-bleed hero underneath the header. */
const OVERLAY_ROUTES = new Set<string>([routes.home])

function isActive(pathname: string, href: string) {
  return href === routes.home ? pathname === routes.home : pathname.startsWith(href)
}

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPathname, setMenuPathname] = useState(pathname)

  // Close the menu when the route changes, including on browser back/forward.
  if (menuPathname !== pathname) {
    setMenuPathname(pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const overlay = OVERLAY_ROUTES.has(pathname)
  const solid = !overlay || scrolled || menuOpen
  const elevated = scrolled && !menuOpen

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-premium duration-[var(--lx-normal)]',
          solid
            ? 'border-b border-border bg-ivory/95 backdrop-blur-sm'
            : 'border-b border-transparent bg-transparent',
          elevated && 'shadow-[0_1px_24px_-16px_rgba(29,27,25,0.55)]',
        )}
      >
        <Container className="flex h-16 items-center justify-between lg:h-20">
          <Link href={routes.home} aria-label={`${siteConfig.name} — home`}>
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href)

                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative block py-1 text-sm tracking-wide transition-premium duration-[var(--lx-fast)]',
                        active ? 'text-charcoal' : 'text-bronze-dark hover:text-charcoal',
                      )}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-bronze transition-premium duration-[var(--lx-normal)]',
                          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                        )}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <BookingLink size="sm">Book Now</BookingLink>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls={MOBILE_NAV_ID}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
            >
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={cn(
                    'block h-px w-6 bg-charcoal transition-premium duration-[var(--lx-normal)]',
                    menuOpen && index === 0 && 'translate-y-[7px] rotate-45',
                    menuOpen && index === 1 && 'opacity-0',
                    menuOpen && index === 2 && '-translate-y-[7px] -rotate-45',
                  )}
                />
              ))}
            </button>
          </div>
        </Container>
      </header>

      <MobileNavigation id={MOBILE_NAV_ID} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
