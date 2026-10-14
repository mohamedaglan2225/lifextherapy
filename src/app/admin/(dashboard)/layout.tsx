import Link from 'next/link'
import type { ReactNode } from 'react'
import { signOut } from '@/app/admin/actions/auth'
import { NotConfigured } from '@/components/admin/NotConfigured'
import { requireAdmin } from '@/lib/cms/admin'
import { getSupabaseConfig } from '@/lib/cms/config'

const nav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/hero', label: 'Home hero' },
  { href: '/admin/contact', label: 'Contact & social' },
  { href: '/admin/promotions', label: 'Promotions' },
]

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!getSupabaseConfig()) return <NotConfigured />
  const { email } = await requireAdmin()

  return (
    <>
      <header className="border-b border-border bg-offwhite">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-6">
            <Link href="/admin" className="font-serif text-xl text-charcoal">
              Life X Therapy <span className="text-bronze">Dashboard</span>
            </Link>
            <Link href="/" target="_blank" className="text-xs font-medium text-bronze underline underline-offset-4 lg:hidden">
              View site
            </Link>
          </div>
          <nav aria-label="Dashboard" className="-mx-1 flex flex-wrap gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm px-3 py-2 text-sm text-charcoal transition-premium duration-[var(--lx-fast)] hover:bg-ivory-dark"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-xs text-bronze-dark">
            <Link href="/" target="_blank" className="hidden font-medium text-bronze underline underline-offset-4 lg:inline">
              View site
            </Link>
            {email && <span className="truncate">{email}</span>}
            <form action={signOut}>
              <button type="submit" className="font-semibold uppercase tracking-[0.12em] text-charcoal hover:text-bronze">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">{children}</main>
    </>
  )
}
