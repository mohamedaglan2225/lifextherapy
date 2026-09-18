import type { MetadataRoute } from 'next'
import { legalPagesPublished, routes, siteConfig } from '@/config/site'
import { services } from '@/data/services'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const absolute = (path: string) => new URL(path, siteConfig.url).toString()

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

  // Placeholder legal pages stay out of the sitemap until they carry real content.
  const legal: MetadataRoute.Sitemap = legalPagesPublished
    ? [
        { url: absolute(routes.privacy), lastModified, changeFrequency: 'yearly', priority: 0.3 },
        { url: absolute(routes.terms), lastModified, changeFrequency: 'yearly', priority: 0.3 },
      ]
    : []

  return [...core, ...servicePages, ...legal]
}
