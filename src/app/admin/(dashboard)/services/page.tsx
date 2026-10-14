import type { Metadata } from 'next'
import { GuardedLink } from '@/components/admin/DirtyGuard'
import { CreateButton, MoveControls } from '@/components/admin/ListControls'
import { Badge, PageTitle } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import type { ServiceDoc } from '@/lib/cms/documents'
import { formatPrice, startingPrice } from '@/lib/cms/format'
import { listDocStates } from '@/lib/cms/repo'
import { docStatus } from '@/lib/cms/status'

export const metadata: Metadata = { title: 'Services' }

export default async function ServicesListPage() {
  const { supabase } = await requireAdmin()
  const services = (await listDocStates(supabase, 'service'))
    .filter((state) => state.draft)
    .sort((a, b) => Number(a.draft!.data.sortOrder) - Number(b.draft!.data.sortOrder) || a.key.localeCompare(b.key))

  return (
    <>
      <PageTitle
        title="Services"
        description="Order, text, images, sessions, prices and Vagaro links. The order here is the order on the website."
        actions={<CreateButton kind="service" label="New service" />}
      />
      <ul className="flex flex-col gap-3">
        {services.map((state, index) => {
          const service = state.draft!.data as unknown as ServiceDoc
          const status = docStatus(state)
          return (
            <li key={state.key} className="flex flex-col gap-3 rounded-sm border border-border bg-offwhite p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <GuardedLink href={`/admin/services/${state.key}`} className="font-serif text-xl text-charcoal underline-offset-4 hover:underline">
                    {service.name}
                  </GuardedLink>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <p className="mt-1 text-xs text-bronze-dark">
                  /services/{service.slug} · {service.sessions.map((session) => `${session.minutes} min`).join(', ')} · from {formatPrice(startingPrice(service))}
                  {service.featuredOnHome ? ' · on home page' : ''}
                </p>
              </div>
              <MoveControls kind="service" docKey={state.key} first={index === 0} last={index === services.length - 1} label={service.name} />
            </li>
          )
        })}
      </ul>
    </>
  )
}
