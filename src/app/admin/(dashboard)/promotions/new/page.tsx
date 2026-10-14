import type { Metadata } from 'next'
import Link from 'next/link'
import { PromotionForm } from '@/components/admin/PromotionForm'
import { requireAdmin } from '@/lib/cms/admin'

export const metadata: Metadata = { title: 'New promotion' }

export default async function NewPromotionPage() {
  await requireAdmin()

  return (
    <>
      <Link href="/admin/promotions" className="text-xs font-medium text-bronze underline underline-offset-4">
        ← All promotions
      </Link>
      <h1 className="mt-4 font-serif text-4xl text-charcoal">New promotion</h1>
      <p className="mt-2 text-sm font-light text-bronze-dark">
        Save as a draft to keep it hidden, or publish to show it on the home page now.
      </p>
      <div className="mt-8">
        <PromotionForm promotion={null} imagePreviewUrl={null} />
      </div>
    </>
  )
}
