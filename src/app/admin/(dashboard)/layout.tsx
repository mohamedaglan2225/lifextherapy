import type { ReactNode } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { NotConfigured } from '@/components/admin/NotConfigured'
import { requireAdmin } from '@/lib/cms/admin'
import { getSupabaseConfig } from '@/lib/cms/config'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!getSupabaseConfig()) return <NotConfigured />
  const { email } = await requireAdmin()
  return <AdminShell email={email}>{children}</AdminShell>
}
