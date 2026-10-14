import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { PromotionForm } from '@/components/admin/PromotionForm'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { draftPreviewUrl, requireAdmin } from '@/lib/cms/admin'
import { readPromotion } from '@/lib/cms/drafts'
import { PromotionActions } from '../PromotionActions'

export const metadata: Metadata = { title: 'Edit promotion' }

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}

export default async function EditPromotionPage({ params, searchParams }: Props) {
  const { id } = await params
  const { created } = await searchParams
  if (!z.uuid().safeParse(id).success) notFound()

  const { supabase } = await requireAdmin()
  const promotion = await readPromotion(supabase, id)
  if (!promotion) notFound()

  return (
    <>
      <Link href="/admin/promotions" className="text-xs font-medium text-bronze underline underline-offset-4">
        ← All promotions
      </Link>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl text-charcoal">{promotion.title}</h1>
          <StatusBadge status={promotion.status} />
        </div>
        <PromotionActions id={promotion.id} title={promotion.title} status={promotion.status} />
      </div>
      {created && (
        <p role="status" className="mt-4 text-sm font-medium text-emerald-800">
          {created === 'published' ? 'Promotion created and published.' : 'Promotion created as a hidden draft.'}
        </p>
      )}
      <div className="mt-8">
        <PromotionForm promotion={promotion} imagePreviewUrl={await draftPreviewUrl(supabase, promotion.imagePath)} />
      </div>
    </>
  )
}
