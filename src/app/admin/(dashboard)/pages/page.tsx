import type { Metadata } from 'next'
import { GuardedLink } from '@/components/admin/DirtyGuard'
import { Badge, PageTitle } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import { listDocStates } from '@/lib/cms/repo'
import { PAGE_DEFS, PAGE_KEYS } from '@/lib/cms/sections'
import { docStatus } from '@/lib/cms/status'

export const metadata: Metadata = { title: 'Pages' }

export default async function PagesPage() {
  const { supabase } = await requireAdmin()
  const states = new Map((await listDocStates(supabase, 'page')).map((state) => [state.key, state]))

  return (
    <>
      <PageTitle title="Pages" description="Edit page text, images, sections and search settings. Service details are edited under Services." />
      <ul className="flex flex-col gap-3">
        {PAGE_KEYS.map((key) => {
          const state = states.get(key)
          const status = state ? docStatus(state) : { tone: 'draft' as const, label: 'Missing — run the seed' }
          return (
            <li key={key}>
              <GuardedLink
                href={`/admin/pages/${key}`}
                className="flex flex-col gap-2 rounded-sm border border-border bg-offwhite p-5 transition-premium duration-[var(--lx-fast)] hover:border-bronze sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="block font-serif text-xl text-charcoal">{PAGE_DEFS[key].label}</span>
                  <span className="text-xs text-bronze-dark">{key === 'service' ? 'Shared layout of every service page' : PAGE_DEFS[key].path}</span>
                </span>
                <Badge tone={status.tone}>{status.label}</Badge>
              </GuardedLink>
            </li>
          )
        })}
      </ul>
    </>
  )
}
