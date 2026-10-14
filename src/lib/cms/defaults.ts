import { businessPlaceholders, routes } from '@/config/site'
import type { Contact, HomeHero } from './schema'

/**
 * The content the site shipped with. It is used only when the CMS is not
 * configured (local development, or before Supabase is connected) or when a
 * key has never been published. `supabase/seed.sql` holds the same values.
 */
export const defaultHomeHero: HomeHero = {
  eyebrow: 'Massage Therapy & Bodywork',
  headline: 'Feel Better.\nMove Better.',
  headlineEmphasis: 'Live Calmer.',
  body: 'Personalized massage therapy and bodywork designed to relieve tension, restore movement, and help you feel your best.',
  image: '/images/hero-massage.jpg',
  imageAlt: 'Massage therapist working on a client in a warmly lit studio',
  primaryLabel: 'Book a Session',
  secondaryLabel: 'Explore Services',
  secondaryHref: routes.services,
}

export const defaultContact: Contact = {
  phone: businessPlaceholders.phone,
  email: businessPlaceholders.emailHref ? businessPlaceholders.email : '',
  address: businessPlaceholders.address,
  hours: businessPlaceholders.hours.map((entry) => ({ day: entry.day, hours: entry.hours })),
  instagramUrl: '',
  facebookUrl: '',
}
