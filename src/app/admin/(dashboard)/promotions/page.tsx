import type { Metadata } from 'next'
import Link from 'next/link'
import { primaryButton } from '@/components/admin/FormFooter'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { requireAdmin } from '@/lib/cms/admin'
import { listPromotions } from '@/lib/cms/drafts'
import { PromotionActions } from './PromotionActions'

export const metadata: Metadata = { title: 'Promotions' }

export default async function PromotionsPage() {
  const { supabase } = await requireAdmin()
  const promotions = await listPromotions(supabase)

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl text-charcoal">Promotions</h1>
          <p className="mt-2 text-sm font-light text-bronze-dark">
            Live promotions appear on the home page, below the hero. Hidden ones are kept as drafts.
          </p>
        </div>
        <Link href="/admin/promotions/new" className={`${primaryButton} self-start`}>
          New promotion
        </Link>
      </div>

      {promotions.length === 0 ? (
        <p className="mt-10 rounded-sm border border-dashed border-border p-10 text-center text-sm text-bronze-dark">
          No promotions yet. The home page shows no promotions section until one is published.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {promotions.map((promotion) => (
            <li
              key={promotion.id}
              className="flex flex-col gap-4 rounded-sm border border-border bg-offwhite p-6 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/admin/promotions/${promotion.id}`}
                    className="font-serif text-xl text-charcoal underline-offset-4 hover:underline"
                  >
                    {promotion.title}
                  </Link>
                  <StatusBadge status={promotion.status} />
                </div>
                {promotion.description && (
                  <p className="mt-1 line-clamp-2 text-sm font-light text-bronze-dark">{promotion.description}</p>
                )}
              </div>
              <PromotionActions id={promotion.id} title={promotion.title} status={promotion.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
