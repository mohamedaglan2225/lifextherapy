import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/cms/metadata'
import { getPage, getSettings } from '@/lib/cms/published'
import { SectionRenderer } from '@/components/cms/SectionRenderer'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('about'), getSettings()])
  return pageMetadata('about', page, settings)
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPage('about'), getSettings()])
  return <SectionRenderer page="about" sections={page.sections} settings={settings} />
}
