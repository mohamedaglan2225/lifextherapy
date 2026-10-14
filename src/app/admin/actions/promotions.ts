'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getAdminSession, publishMedia } from '@/lib/cms/admin'
import { cmsTags } from '@/lib/cms/published'
import { promotionSchema } from '@/lib/cms/schema'
import {
  errorState,
  formText,
  sessionExpired,
  successState,
  validationState,
  type FormState,
} from './state'

const promotionId = z.uuid()

async function adminOrThrow() {
  const session = await getAdminSession()
  if (!session) throw new Error('Your session has ended. Sign in again to continue.')
  return session
}

function refreshPromotions() {
  updateTag(cmsTags.promotions)
  revalidatePath('/admin', 'layout')
}

export async function savePromotion(_previous: FormState, formData: FormData): Promise<FormState> {
  const session = await getAdminSession()
  if (!session) return sessionExpired
  const { supabase } = session

  const existingId = formText(formData, 'id')
  if (existingId && !promotionId.safeParse(existingId).success) return errorState('Unknown promotion.')

  const parsed = promotionSchema.safeParse({
    title: formText(formData, 'title'),
    description: formText(formData, 'description'),
    imagePath: formText(formData, 'imagePath'),
    imageAlt: formText(formData, 'imageAlt'),
    linkUrl: formText(formData, 'linkUrl'),
    linkLabel: formText(formData, 'linkLabel'),
    sortOrder: formText(formData, 'sortOrder') || '0',
  })
  if (!parsed.success) return validationState(parsed.error)

  const row = {
    title: parsed.data.title,
    description: parsed.data.description,
    image_path: parsed.data.imagePath || null,
    image_alt: parsed.data.imagePath ? parsed.data.imageAlt : '',
    link_url: parsed.data.linkUrl || null,
    link_label: parsed.data.linkUrl ? parsed.data.linkLabel : '',
    sort_order: parsed.data.sortOrder,
  }

  let id = existingId
  if (id) {
    const { error, count } = await supabase.from('promotion_drafts').update(row, { count: 'exact' }).eq('id', id)
    if (error || count !== 1) return errorState('The promotion could not be saved. Please try again.')
  } else {
    const { data, error } = await supabase.from('promotion_drafts').insert(row).select('id').single()
    if (error || !data) return errorState('The promotion could not be created. Please try again.')
    id = data.id as string
  }

  const publish = formText(formData, 'intent') === 'publish'
  if (publish) {
    try {
      await publishMedia(supabase, row.image_path)
    } catch (error) {
      return errorState(`Saved, but not published. ${(error as Error).message}`)
    }
    const { error } = await supabase.rpc('publish_promotion', { p_id: id })
    if (error) return errorState('Saved, but publishing failed. Please try again.')
    updateTag(cmsTags.promotions)
  }
  revalidatePath('/admin', 'layout')

  if (!existingId) redirect(`/admin/promotions/${id}?created=${publish ? 'published' : 'draft'}`)
  return successState(
    publish
      ? 'Published. The promotion is now live on the home page.'
      : 'Draft saved. Visitors still see the published version until you publish.',
  )
}

export async function publishPromotion(id: string) {
  if (!promotionId.safeParse(id).success) throw new Error('Unknown promotion.')
  const { supabase } = await adminOrThrow()

  const { data, error } = await supabase.from('promotion_drafts').select('image_path').eq('id', id).single()
  if (error || !data) throw new Error('That promotion no longer exists.')

  await publishMedia(supabase, data.image_path as string | null)
  const { error: publishError } = await supabase.rpc('publish_promotion', { p_id: id })
  if (publishError) throw new Error('Publishing failed. Please try again.')
  refreshPromotions()
}

export async function hidePromotion(id: string) {
  if (!promotionId.safeParse(id).success) throw new Error('Unknown promotion.')
  const { supabase } = await adminOrThrow()

  const { error } = await supabase.rpc('unpublish_promotion', { p_id: id })
  if (error) throw new Error('The promotion could not be hidden. Please try again.')
  refreshPromotions()
}

export async function deletePromotion(id: string) {
  if (!promotionId.safeParse(id).success) throw new Error('Unknown promotion.')
  const { supabase } = await adminOrThrow()

  // Deleting the draft also removes its published copy (foreign key cascade).
  const { error } = await supabase.from('promotion_drafts').delete().eq('id', id)
  if (error) throw new Error('The promotion could not be deleted. Please try again.')
  refreshPromotions()
  redirect('/admin/promotions')
}
