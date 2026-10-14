import type { IconName } from '@/components/ui/Icon'
import { phoneHref, type Contact } from './schema'

export type SocialLink = { label: string; href: string; icon: IconName; placeholder: boolean }

/**
 * Social links in display order. Until a real address is entered the link keeps
 * the original `#` placeholder and announces itself as one.
 */
export function socialLinks(contact: Contact): SocialLink[] {
  return [
    { label: 'Instagram', url: contact.instagramUrl, icon: 'instagram' as const },
    { label: 'Facebook', url: contact.facebookUrl, icon: 'facebook' as const },
  ].map(({ label, url, icon }) => ({ label, icon, href: url || '#', placeholder: !url }))
}

export function contactLinks(contact: Contact) {
  return {
    phoneHref: phoneHref(contact.phone),
    emailHref: contact.email ? `mailto:${contact.email}` : '',
    emailLabel: contact.email || '[Email placeholder]',
  }
}
