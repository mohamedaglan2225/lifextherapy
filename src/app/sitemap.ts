import type { MetadataRoute } from 'next'
import { routes, siteConfig } from '@/config/site'
import { getPage, getServices } from '@/lib/cms/published'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const absolute = (path: string) => new URL(path, siteConfig.url).toString()
  const [services, privacy, terms] = await Promise.all([getServices(), getPage('privacy'), getPage('terms')])

  const core: MetadataRoute.Sitemap = [
    { url: absolute(routes.home), lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: absolute(routes.services), lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: absolute(routes.about), lastModified, changeFrequency: 'yearly', priority: 0.7 },
    { url: absolute(routes.faq), lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: absolute(routes.contact), lastModified, changeFrequency: 'yearly', priority: 0.7 },
  ]

  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: absolute(routes.service(service.slug)),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Legal pages stay out of the sitemap until they are marked as ready to index.
  const legal: MetadataRoute.Sitemap = [
    ...(privacy.indexable ? [{ url: absolute(routes.privacy), lastModified, changeFrequency: 'yearly' as const, priority: 0.3 }] : []),
    ...(terms.indexable ? [{ url: absolute(routes.terms), lastModified, changeFrequency: 'yearly' as const, priority: 0.3 }] : []),
  ]

  return [...core, ...servicePages, ...legal]
}
