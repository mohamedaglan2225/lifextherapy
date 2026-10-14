import type { Metadata } from 'next'
import { GuardedLink } from '@/components/admin/DirtyGuard'
import { CreateButton, MoveControls } from '@/components/admin/ListControls'
import { Badge, formatDateTime, PageTitle } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import type { PromotionDoc } from '@/lib/cms/documents'
import { listDocStates } from '@/lib/cms/repo'
import { PAGE_DEFS } from '@/lib/cms/sections'
import { docStatus } from '@/lib/cms/status'

export const metadata: Metadata = { title: 'Promotions' }

export default async function PromotionsListPage() {
  const { supabase } = await requireAdmin()
  const promotions = (await listDocStates(supabase, 'promotion'))
    .filter((state) => state.draft)
    .sort((a, b) => Number(a.draft!.data.sortOrder) - Number(b.draft!.data.sortOrder) || a.key.localeCompare(b.key))

  return (
    <>
      <PageTitle
        title="Promotions"
        description="Offers shown in the Promotions section of the pages you choose, optionally on a schedule (Eastern Time)."
        actions={<CreateButton kind="promotion" label="New promotion" />}
      />
      {promotions.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border p-10 text-center text-sm text-bronze-dark">No promotions yet. Nothing is shown on the website until you publish one.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {promotions.map((state, index) => {
            const promotion = state.draft!.data as unknown as PromotionDoc
            const status = docStatus(state)
            return (
              <li key={state.key} className="flex flex-col gap-3 rounded-sm border border-border bg-offwhite p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <GuardedLink href={`/admin/promotions/${state.key}`} className="font-serif text-xl text-charcoal underline-offset-4 hover:underline">
                      {promotion.title}
                    </GuardedLink>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-bronze-dark">
                    {promotion.placements.map((page) => PAGE_DEFS[page].label).join(', ')}
                    {promotion.startsAt ? ` · from ${formatDateTime(promotion.startsAt)}` : ''}
                    {promotion.endsAt ? ` · until ${formatDateTime(promotion.endsAt)}` : ''}
                  </p>
                </div>
                <MoveControls kind="promotion" docKey={state.key} first={index === 0} last={index === promotions.length - 1} label={promotion.title} />
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
