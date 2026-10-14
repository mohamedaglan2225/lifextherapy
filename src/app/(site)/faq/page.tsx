import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/cms/metadata'
import { getPage, getSettings } from '@/lib/cms/published'
import { SectionRenderer } from '@/components/cms/SectionRenderer'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('faq'), getSettings()])
  return pageMetadata('faq', page, settings)
}

export default async function FaqPage() {
  const [page, settings] = await Promise.all([getPage('faq'), getSettings()])
  return <SectionRenderer page="faq" sections={page.sections} settings={settings} />
}
