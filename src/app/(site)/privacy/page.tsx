import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/cms/metadata'
import { getPage, getSettings } from '@/lib/cms/published'
import { SectionRenderer } from '@/components/cms/SectionRenderer'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('privacy'), getSettings()])
  return pageMetadata('privacy', page, settings)
}

export default async function PrivacyPage() {
  const [page, settings] = await Promise.all([getPage('privacy'), getSettings()])
  return <SectionRenderer page="privacy" sections={page.sections} settings={settings} />
}
