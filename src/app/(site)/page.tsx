import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/cms/metadata'
import { getPage, getSettings } from '@/lib/cms/published'
import { SectionRenderer } from '@/components/cms/SectionRenderer'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('home'), getSettings()])
  return pageMetadata('home', page, settings)
}

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPage('home'), getSettings()])
  return <SectionRenderer page="home" sections={page.sections} settings={settings} />
}
