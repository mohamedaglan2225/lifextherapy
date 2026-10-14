import Link from 'next/link'
import { formatTimestamp } from '@/components/admin/StatusBadge'
import { requireAdmin } from '@/lib/cms/admin'
import { listPromotions, readContactState, readHomeHeroState } from '@/lib/cms/drafts'

export default async function DashboardPage() {
  const { supabase } = await requireAdmin()
  const [hero, contact, promotions] = await Promise.all([
    readHomeHeroState(supabase),
    readContactState(supabase),
    listPromotions(supabase),
  ])
  const live = promotions.filter((promotion) => promotion.status !== 'draft').length

  const cards = [
    {
      href: '/admin/hero',
      title: 'Home hero',
      detail: hero.hasUnpublishedChanges ? 'Unpublished changes' : 'Up to date',
      meta: `Last published ${formatTimestamp(hero.publishedAt)}`,
    },
    {
      href: '/admin/contact',
      title: 'Contact & social',
      detail: contact.hasUnpublishedChanges ? 'Unpublished changes' : 'Up to date',
      meta: `Last published ${formatTimestamp(contact.publishedAt)}`,
    },
    {
      href: '/admin/promotions',
      title: 'Promotions',
      detail: `${live} live · ${promotions.length - live} hidden`,
      meta: 'Shown on the home page while live',
    },
  ]

  return (
    <>
      <h1 className="font-serif text-4xl text-charcoal">Overview</h1>
      <p className="mt-2 text-sm font-light text-bronze-dark">
        Edit a section, save it as a draft, and publish when it is ready. Visitors only ever see published content.
      </p>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="flex h-full flex-col rounded-sm border border-border bg-offwhite p-6 transition-premium duration-[var(--lx-fast)] hover:border-bronze"
            >
              <span className="font-serif text-2xl text-charcoal">{card.title}</span>
              <span className="mt-3 text-sm font-semibold text-charcoal">{card.detail}</span>
              <span className="mt-1 text-xs text-bronze-dark">{card.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
