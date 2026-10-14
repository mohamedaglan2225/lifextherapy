import type { Metadata } from 'next'
import { connection } from 'next/server'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s · Life X Therapy Dashboard' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // The dashboard is per-user and must never be prerendered or cached.
  await connection()
  return <div className="min-h-screen bg-ivory text-charcoal">{children}</div>
}
