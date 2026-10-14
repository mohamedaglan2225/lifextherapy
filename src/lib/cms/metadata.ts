import 'server-only'
import type { Metadata } from 'next'
import type { PageDoc, Settings } from './documents'
import { mediaUrl } from './media'
import { PAGE_DEFS, type PageKey } from './sections'

export const GENERATED_SHARE_IMAGE = '/social-image'

/** Share image: the page's own, else the site default, else the generated one. */
export function shareImages(settings: Settings, image?: { src: string; alt: string }) {
  const chosen = image?.src ? image : settings.seo.shareImage.src ? settings.seo.shareImage : null
  if (!chosen) return [{ url: GENERATED_SHARE_IMAGE, width: 1200, height: 630, alt: settings.seo.defaultTitle }]
  return [{ url: mediaUrl(chosen.src), alt: chosen.alt || settings.seo.defaultTitle }]
}

export function siteMetadata(settings: Settings, siteUrl: string): Metadata {
  const images = shareImages(settings)
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.seo.defaultTitle, template: `%s | ${settings.siteName}` },
    description: settings.seo.description,
    applicationName: settings.siteName,
    alternates: { canonical: '/' },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      title: settings.seo.defaultTitle,
      description: settings.seo.description,
      url: '/',
      locale: 'en_US',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seo.defaultTitle,
      description: settings.seo.description,
      images,
    },
  }
}

export function pageMetadata(key: PageKey, page: PageDoc, settings: Settings): Metadata {
  const def = PAGE_DEFS[key]
  const { title, description, shareImage } = page.seo
  const images = shareImages(settings, shareImage)

  if (key === 'home') {
    return {
      ...(title ? { title: { absolute: title } } : {}),
      ...(description ? { description } : {}),
      alternates: { canonical: '/' },
      ...(title || description || shareImage.src
        ? {
            openGraph: {
              type: 'website',
              siteName: settings.siteName,
              title: title || settings.seo.defaultTitle,
              description: description || settings.seo.description,
              url: '/',
              locale: 'en_US',
              images,
            },
          }
        : {}),
    }
  }

  const fullTitle = `${title || def.label} | ${settings.siteName}`
  return {
    title: title || def.label,
    ...(description ? { description } : {}),
    alternates: { canonical: def.path },
    ...(def.legal ? { robots: { index: page.indexable, follow: true } } : {}),
    ...(!def.legal || shareImage.src
      ? { openGraph: { title: fullTitle, ...(description ? { description } : {}), url: def.path, images } }
      : {}),
  }
}
