import { GuardedLink } from '@/components/admin/DirtyGuard'
import { RefreshAllButton } from '@/components/admin/ListControls'
import { Badge, formatDateTime, PageTitle, Panel } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/cms/admin'
import { DOC_KINDS, type DocKind, type PromotionDoc, type ServiceDoc } from '@/lib/cms/documents'
import { hasUnpublishedChanges, listDocStates, type DocState } from '@/lib/cms/repo'
import { PAGE_DEFS, type PageKey } from '@/lib/cms/sections'
import { upcomingPromotions } from '@/lib/cms/status'

function docLabel(state: DocState) {
  const data = (state.draft?.data ?? {}) as Record<string, unknown>
  switch (state.kind) {
    case 'settings':
      return { label: 'Settings', href: '/admin/settings' }
    case 'faqs':
      return { label: 'FAQs', href: '/admin/faqs' }
    case 'page':
      return { label: `Page: ${PAGE_DEFS[state.key as PageKey]?.label ?? state.key}`, href: `/admin/pages/${state.key}` }
    case 'service':
      return { label: `Service: ${(data as unknown as ServiceDoc).name}`, href: `/admin/services/${state.key}` }
    case 'promotion':
      return { label: `Promotion: ${(data as unknown as PromotionDoc).title}`, href: `/admin/promotions/${state.key}` }
  }
}

export default async function OverviewPage() {
  const { supabase } = await requireAdmin()
  const [all, recent] = await Promise.all([
    Promise.all(DOC_KINDS.map((kind: DocKind) => listDocStates(supabase, kind))).then((lists) => lists.flat()),
    supabase.from('cms_revisions').select('kind, key, published_at, published_by_email').not('published_by_email', 'is', null).order('id', { ascending: false }).limit(8),
  ])
  const pending = all.filter((state) => hasUnpublishedChanges(state) && !(state.kind === 'promotion' && !state.published))
  const unpublishedNew = all.filter((state) => !state.published && (state.kind === 'service' || state.kind === 'promotion'))
  const upcoming = upcomingPromotions(all)
  const byKey = new Map(all.map((state) => [`${state.kind}:${state.key}`, state]))

  return (
    <>
      <PageTitle title="Overview" description="Edit, save a draft, preview it, then publish. Visitors only ever see published content." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Unpublished changes" description="Drafts that differ from the live website.">
          {pending.length === 0 ? (
            <p className="text-sm text-bronze-dark">Everything is published.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pending.map((state) => {
                const { label, href } = docLabel(state)
                return (
                  <li key={`${state.kind}:${state.key}`} className="flex items-center justify-between gap-3 text-sm">
                    <GuardedLink href={href} className="text-charcoal underline underline-offset-4">
                      {label}
                    </GuardedLink>
                    <span className="text-xs text-bronze-dark">saved {formatDateTime(state.draft?.updatedAt)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
        <Panel title="Not on the website yet" description="New services and promotions that have never been published.">
          {unpublishedNew.length === 0 ? (
            <p className="text-sm text-bronze-dark">None.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {unpublishedNew.map((state) => {
                const { label, href } = docLabel(state)
                return (
                  <li key={`${state.kind}:${state.key}`} className="text-sm">
                    <GuardedLink href={href} className="text-charcoal underline underline-offset-4">
                      {label}
                    </GuardedLink>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
        <Panel title="Scheduled promotions">
          {upcoming.length === 0 ? (
            <p className="text-sm text-bronze-dark">No promotions are waiting to start.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((state) => {
                const promotion = state.published!.data as unknown as PromotionDoc
                return (
                  <li key={state.key} className="flex items-center justify-between gap-3 text-sm">
                    <GuardedLink href={`/admin/promotions/${state.key}`} className="text-charcoal underline underline-offset-4">
                      {promotion.title}
                    </GuardedLink>
                    <Badge tone="scheduled">starts {formatDateTime(promotion.startsAt)}</Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
        <Panel title="Recently published">
          {(recent.data ?? []).length === 0 ? (
            <p className="text-sm text-bronze-dark">Nothing has been published from the dashboard yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {(recent.data ?? []).map((row, index) => {
                const state = byKey.get(`${row.kind}:${row.key}`)
                const label = state ? docLabel(state).label : `${row.kind} (deleted)`
                return (
                  <li key={index} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-charcoal">{label}</span>
                    <span className="text-xs text-bronze-dark">
                      {formatDateTime(row.published_at as string)} · {row.published_by_email as string}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
        <Panel
          title="Live site refresh"
          description="Publishing refreshes the affected pages automatically. If a refresh ever failed, this rebuilds every page from the published content on its next visit."
        >
          <RefreshAllButton />
        </Panel>
      </div>
    </>
  )
}
