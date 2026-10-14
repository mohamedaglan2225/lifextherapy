'use client'

import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { signOut } from '@/app/admin/actions/auth'
import { cn } from '@/lib/cn'
import { DirtyGuardProvider, GuardedLink, useDirtyGuard } from './DirtyGuard'

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/faqs', label: 'FAQs' },
  { href: '/admin/promotions', label: 'Promotions' },
  { href: '/admin/media', label: 'Media library' },
  { href: '/admin/settings', label: 'Settings' },
]

function isActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
}

function SignOutButton() {
  const { confirmLeave } = useDirtyGuard()
  return (
    <form action={signOut} onSubmit={(event) => !confirmLeave() && event.preventDefault()}>
      <button type="submit" className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal hover:text-bronze">
        Sign out
      </button>
    </form>
  )
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Dashboard">
      <ul className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <li key={item.href}>
              <GuardedLink
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-sm px-3 py-2.5 text-sm transition-premium duration-[var(--lx-fast)]',
                  active ? 'bg-charcoal text-ivory' : 'text-charcoal hover:bg-ivory-dark',
                )}
              >
                {item.label}
              </GuardedLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Sidebar layout on large screens, collapsible menu on phones. */
export function AdminShell({ email, children }: { email: string | null; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <DirtyGuardProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
        <aside className="border-b border-border bg-offwhite lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-4 lg:py-6">
            <GuardedLink href="/admin" className="font-serif text-lg leading-tight text-charcoal">
              Life X Therapy
              <span className="block text-xs font-sans font-semibold uppercase tracking-[0.18em] text-bronze">Dashboard</span>
            </GuardedLink>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="admin-menu"
              className="rounded-sm border border-border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] lg:hidden"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
          <div id="admin-menu" className={cn('px-3 pb-4 lg:flex lg:flex-1 lg:flex-col lg:pb-6', !menuOpen && 'hidden lg:flex')}>
            <Navigation onNavigate={() => setMenuOpen(false)} />
            <div className="mt-6 flex flex-col gap-3 border-t border-border px-3 pt-5 text-xs text-bronze-dark lg:mt-auto">
              <a href="/" target="_blank" rel="noreferrer" className="font-semibold text-bronze underline underline-offset-4">
                View website ↗
              </a>
              {email && <span className="truncate">{email}</span>}
              <SignOutButton />
            </div>
          </div>
        </aside>
        <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </DirtyGuardProvider>
  )
}
