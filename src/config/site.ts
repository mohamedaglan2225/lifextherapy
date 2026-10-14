export type NavLink = {
  label: string
  href: string
}

export const siteConfig = {
  /** Set NEXT_PUBLIC_SITE_URL once the production domain is chosen. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const

export const routes = {
  home: '/',
  services: '/services',
  service: (slug: string) => `/services/${slug}`,
  about: '/about',
  faq: '/faq',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
} as const
