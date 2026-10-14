'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { getAdminSession, publishMedia } from '@/lib/cms/admin'
import { cmsTags } from '@/lib/cms/published'
import { contactSchema, homeHeroSchema, type ContentKey } from '@/lib/cms/schema'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  errorState,
  formText,
  sessionExpired,
  successState,
  validationState,
  type FormState,
} from './state'

function normalizeLines(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}

async function saveDraftAndMaybePublish(
  supabase: SupabaseClient,
  key: ContentKey,
  data: Record<string, unknown>,
  publish: boolean,
  imagePath: string | null,
): Promise<FormState> {
  const { error: saveError } = await supabase.from('content_drafts').upsert({ key, data })
  if (saveError) return errorState('The draft could not be saved. Please try again.')

  revalidatePath('/admin', 'layout')
  if (!publish) return successState('Draft saved. Visitors still see the published version until you publish.')

  try {
    await publishMedia(supabase, imagePath)
  } catch (error) {
    return errorState(`Draft saved, but not published. ${(error as Error).message}`)
  }

  const { error: publishError } = await supabase.rpc('publish_content', { p_key: key })
  if (publishError) return errorState('Draft saved, but publishing failed. Please try again.')

  // Expire the cached public pages that read this content; the next visit renders fresh.
  updateTag(cmsTags[key])
  return successState('Published. The live website now shows these changes.')
}

export async function saveHomeHero(_previous: FormState, formData: FormData): Promise<FormState> {
  const session = await getAdminSession()
  if (!session) return sessionExpired

  const parsed = homeHeroSchema.safeParse({
    eyebrow: formText(formData, 'eyebrow'),
    headline: normalizeLines(formText(formData, 'headline')),
    headlineEmphasis: formText(formData, 'headlineEmphasis'),
    body: formText(formData, 'body'),
    image: formText(formData, 'image'),
    imageAlt: formText(formData, 'imageAlt'),
    primaryLabel: formText(formData, 'primaryLabel'),
    secondaryLabel: formText(formData, 'secondaryLabel'),
    secondaryHref: formText(formData, 'secondaryHref'),
  })
  if (!parsed.success) return validationState(parsed.error)

  return saveDraftAndMaybePublish(
    session.supabase,
    'home_hero',
    parsed.data,
    formText(formData, 'intent') === 'publish',
    parsed.data.image,
  )
}

export async function saveContact(_previous: FormState, formData: FormData): Promise<FormState> {
  const session = await getAdminSession()
  if (!session) return sessionExpired

  const days = formData.getAll('hoursDay').map(String)
  const hours = formData.getAll('hoursValue').map(String)

  const parsed = contactSchema.safeParse({
    phone: formText(formData, 'phone'),
    email: formText(formData, 'email'),
    address: formText(formData, 'address'),
    hours: days.map((day, index) => ({ day, hours: hours[index] ?? '' })),
    instagramUrl: formText(formData, 'instagramUrl'),
    facebookUrl: formText(formData, 'facebookUrl'),
  })
  if (!parsed.success) return validationState(parsed.error)

  return saveDraftAndMaybePublish(
    session.supabase,
    'contact',
    parsed.data,
    formText(formData, 'intent') === 'publish',
    null,
  )
}
