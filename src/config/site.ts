export type NavLink = {
  label: string
  href: string
}

export const siteConfig = {
  name: 'Life X Therapy',
  tagline: 'Massage & Bodywork',
  title: 'Life X Therapy | Massage Therapy & Bodywork',
  description:
    'Personalized massage therapy and bodywork designed to relieve tension, restore movement, and help you feel your best.',
  /** Set NEXT_PUBLIC_SITE_URL once the production domain is chosen. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const

/**
 * Privacy and Terms are structural placeholders until the real legal copy is
 * supplied. Flipping this to `true` indexes them and adds them to the sitemap.
 */
export const legalPagesPublished = false

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

export const navLinks: NavLink[] = [
  { label: 'Home', href: routes.home },
  { label: 'Services', href: routes.services },
  { label: 'About', href: routes.about },
  { label: 'FAQ', href: routes.faq },
  { label: 'Contact', href: routes.contact },
]

/**
 * Phone and address are the confirmed business details. Every other value
 * below is placeholder copy from the approved design and must be replaced
 * before launch.
 */
export const businessPlaceholders = {
  phone: '(321) 467-4569',
  phoneHref: 'tel:+13214674569',
  email: '[Email placeholder]',
  /** Empty until a real address is supplied; the markup then becomes a live mailto: link. */
  emailHref: '',
  address: '1541 S Wickham Rd, West Melbourne, FL 32904',
  hours: [
    { day: 'Monday – Friday', hours: '[Hours placeholder]' },
    { day: 'Saturday', hours: '[Hours placeholder]' },
    { day: 'Sunday', hours: '[Hours placeholder]' },
  ],
  therapistName: '[Therapist Name]',
  social: [
    { label: 'Instagram', href: '#', icon: 'instagram' as const, placeholder: true },
    { label: 'Facebook', href: '#', icon: 'facebook' as const, placeholder: true },
  ],
  legal: [
    { label: 'Privacy Policy', href: routes.privacy },
    { label: 'Terms', href: routes.terms },
  ],
} as const
