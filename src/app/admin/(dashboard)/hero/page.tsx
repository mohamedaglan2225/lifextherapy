import type { Metadata } from 'next'
import { HeroForm } from '@/components/admin/HeroForm'
import { formatTimestamp } from '@/components/admin/StatusBadge'
import { draftPreviewUrl, requireAdmin } from '@/lib/cms/admin'
import { readHomeHeroState } from '@/lib/cms/drafts'

export const metadata: Metadata = { title: 'Home hero' }

export default async function HeroEditorPage() {
  const { supabase } = await requireAdmin()
  const hero = await readHomeHeroState(supabase)

  return (
    <>
      <h1 className="font-serif text-4xl text-charcoal">Home hero</h1>
      <p className="mt-2 text-sm font-light text-bronze-dark">
        The first thing visitors see on the home page. Last published {formatTimestamp(hero.publishedAt)}.
        {hero.hasUnpublishedChanges && <strong className="font-semibold text-amber-900"> You have unpublished changes.</strong>}
      </p>
      <div className="mt-8">
        <HeroForm hero={hero.value} imagePreviewUrl={await draftPreviewUrl(supabase, hero.value.image)} />
      </div>
    </>
  )
}
