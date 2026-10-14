import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/cms/metadata'
import { getPage, getSettings } from '@/lib/cms/published'
import { SectionRenderer } from '@/components/cms/SectionRenderer'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('services'), getSettings()])
  return pageMetadata('services', page, settings)
}

export default async function ServicesPage() {
  const [page, settings] = await Promise.all([getPage('services'), getSettings()])
  return <SectionRenderer page="services" sections={page.sections} settings={settings} />
}
