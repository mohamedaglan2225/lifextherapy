'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navLinks, routes } from '@/config/site'
import { BookingLink } from '@/components/ui/BookingLink'
import { cn } from '@/lib/cn'

type MobileNavigationProps = {
  id: string
  open: boolean
  onClose: () => void
}

export function MobileNavigation({ id, open, onClose }: MobileNavigationProps) {
  const pathname = usePathname()

  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        'fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ivory px-8 pt-20 pb-10 transition-premium duration-[var(--lx-normal)] md:hidden',
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
      )}
    >
      <nav aria-label="Mobile" className="mt-8">
        <ul className="flex flex-col">
          {navLinks.map((link, index) => {
            const active =
              link.href === routes.home ? pathname === routes.home : pathname.startsWith(link.href)

            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  style={{ transitionDelay: open ? `${90 + index * 45}ms` : '0ms' }}
                  className={cn(
                    'flex items-center justify-between border-b border-border py-5 font-serif text-2xl transition-premium duration-[var(--lx-normal)]',
                    active ? 'text-bronze' : 'text-charcoal',
                    open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
                  )}
                >
                  {link.label}
                  {active && (
                    <span aria-hidden="true" className="h-px w-6 bg-bronze" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div
        style={{ transitionDelay: open ? `${90 + navLinks.length * 45}ms` : '0ms' }}
        className={cn(
          'mt-10 transition-premium duration-[var(--lx-normal)]',
          open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <BookingLink size="bar" onClick={onClose}>
          Book Now
        </BookingLink>
      </div>
    </div>
  )
}
