import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { routes } from '@/config/site'
import { shareImages } from '@/lib/cms/metadata'
import { getAllServices, getPage, getServices, getSettings, type ServiceItem } from '@/lib/cms/published'
import { SectionRenderer } from '@/components/cms/SectionRenderer'

type ServicePageProps = {
  params: Promise<{ slug: string }>
}

/** Services published at build time are prerendered; newer ones render on first visit. */
export async function generateStaticParams() {
  return (await getServices()).map((service) => ({ slug: service.slug }))
}

type Resolution = { service: ServiceItem } | { redirectTo: string; permanent: boolean } | null

async function resolve(slug: string): Promise<Resolution> {
  const all = await getAllServices()
  const match = all.find((service) => service.slug === slug)
  if (match) return match.status === 'active' ? { service: match } : { redirectTo: routes.services, permanent: false }
  // An address that changed keeps working: old addresses redirect permanently.
  const renamed = all.find((service) => service.previousSlugs.includes(slug))
  if (renamed) {
    return renamed.status === 'active'
      ? { redirectTo: routes.service(renamed.slug), permanent: true }
      : { redirectTo: routes.services, permanent: false }
  }
  return null
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  const [resolution, settings] = await Promise.all([resolve(slug), getSettings()])
  if (!resolution || !('service' in resolution)) return {}
  const { service } = resolution
  const url = routes.service(service.slug)
  const title = service.seo.title || service.name

  return {
    title,
    description: service.seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${settings.siteName}`,
      description: service.seo.description,
      url,
      images: shareImages(settings, service.seo.shareImage),
    },
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const resolution = await resolve(slug)
  if (!resolution) notFound()
  if ('redirectTo' in resolution) {
    if (resolution.permanent) permanentRedirect(resolution.redirectTo)
    redirect(resolution.redirectTo)
  }

  const [layout, settings] = await Promise.all([getPage('service'), getSettings()])
  return <SectionRenderer page="service" sections={layout.sections} settings={settings} service={resolution.service} />
}
