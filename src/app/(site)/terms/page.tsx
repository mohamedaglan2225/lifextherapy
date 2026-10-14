import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/cms/metadata'
import { getPage, getSettings } from '@/lib/cms/published'
import { SectionRenderer } from '@/components/cms/SectionRenderer'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('terms'), getSettings()])
  return pageMetadata('terms', page, settings)
}

export default async function TermsPage() {
  const [page, settings] = await Promise.all([getPage('terms'), getSettings()])
  return <SectionRenderer page="terms" sections={page.sections} settings={settings} />
}
