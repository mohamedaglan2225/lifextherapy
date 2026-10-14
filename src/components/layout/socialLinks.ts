import type { IconName } from '@/components/ui/Icon'

export type SocialLink = { label: string; href: string; icon: IconName; placeholder: boolean }

/**
 * Social links in display order. Until a real address is entered the link keeps
 * the original `#` placeholder and announces itself as one.
 */
export function socialLinks(social: { instagramUrl: string; facebookUrl: string }): SocialLink[] {
  return [
    { label: 'Instagram', url: social.instagramUrl, icon: 'instagram' as const },
    { label: 'Facebook', url: social.facebookUrl, icon: 'facebook' as const },
  ].map(({ label, url, icon }) => ({ label, icon, href: url || '#', placeholder: !url }))
}
