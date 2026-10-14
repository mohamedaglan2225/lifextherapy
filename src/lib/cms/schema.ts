import { z } from 'zod'

/**
 * Content shapes shared by the admin editors (validating input) and the public
 * site (validating what it reads back). Published data is parsed again on read,
 * so even a hand-edited database row cannot inject an unsafe link or image.
 */

/** Uploaded media is always stored as `<uuid>.<ext>` at the bucket root. */
export const UPLOADED_IMAGE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$/

/** Images bundled with the site in `public/images`. */
export const STATIC_IMAGE_PATTERN = /^\/images\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/

export function isUploadedImage(value: string) {
  return UPLOADED_IMAGE_PATTERN.test(value)
}

/** https URLs, or same-site paths such as `/services` (never `//host`). */
export function isSafeHref(value: string) {
  // Browsers treat `\` like `/`, so `/\host` would leave the site; reject both.
  if (value.startsWith('/')) return !/^\/[/\\]/.test(value) && !/[\s\\]/.test(value)
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !/\s/.test(value)
  } catch {
    return false
  }
}

function isHttpsUrl(value: string) {
  return !value.startsWith('/') && isSafeHref(value)
}

const text = (max: number) => z.string().trim().max(max)
const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} must be ${max} characters or fewer.`)

const imageValue = z
  .string()
  .trim()
  .refine((value) => STATIC_IMAGE_PATTERN.test(value) || isUploadedImage(value), 'Choose an image.')

export const homeHeroSchema = z.object({
  eyebrow: requiredText('Eyebrow', 80),
  headline: requiredText('Headline', 120).refine(
    (value) => value.split('\n').length <= 3,
    'Use at most three headline lines.',
  ),
  headlineEmphasis: text(60),
  body: requiredText('Intro text', 300),
  image: imageValue,
  imageAlt: requiredText('Image description', 160),
  primaryLabel: requiredText('Booking button text', 40),
  secondaryLabel: requiredText('Second button text', 40),
  secondaryHref: requiredText('Second button link', 500).refine(
    isSafeHref,
    'Use a page on this site (such as /services) or a full https:// address.',
  ),
})

export type HomeHero = z.infer<typeof homeHeroSchema>

const optionalSocialUrl = (label: string) =>
  text(500).refine((value) => value === '' || isHttpsUrl(value), `${label} must be a full https:// address.`)

export const contactSchema = z.object({
  phone: requiredText('Phone', 40).refine(
    (value) => phoneDigits(value).length >= 7,
    'Enter a phone number with at least 7 digits.',
  ),
  email: text(254).refine(
    (value) => value === '' || z.email().safeParse(value).success,
    'Enter a valid email address, or leave it empty.',
  ),
  address: requiredText('Address', 200),
  hours: z
    .array(z.object({ day: requiredText('Day', 40), hours: requiredText('Hours', 60) }))
    .min(1, 'Add at least one row of business hours.')
    .max(7, 'Use at most seven rows of business hours.'),
  instagramUrl: optionalSocialUrl('Instagram link'),
  facebookUrl: optionalSocialUrl('Facebook link'),
})

export type Contact = z.infer<typeof contactSchema>

export const promotionSchema = z
  .object({
    title: requiredText('Title', 120),
    description: text(600),
    imagePath: z
      .string()
      .trim()
      .refine((value) => value === '' || isUploadedImage(value), 'Upload the image again.'),
    imageAlt: text(200),
    linkUrl: text(500).refine((value) => value === '' || isSafeHref(value), 'Use a page on this site (such as /services) or a full https:// address.'),
    linkLabel: text(40),
    sortOrder: z.coerce.number().int().min(0).max(999),
  })
  .refine((value) => value.imagePath === '' || value.imageAlt !== '', {
    message: 'Describe the image for visitors using screen readers.',
    path: ['imageAlt'],
  })

export type PromotionInput = z.infer<typeof promotionSchema>

export type Promotion = {
  id: string
  title: string
  description: string
  imagePath: string | null
  imageAlt: string
  linkUrl: string | null
  linkLabel: string
  sortOrder: number
}

/** Row shape of `promotions_published` / `promotion_drafts`, validated on read. */
export const promotionRowSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  image_path: z.string().refine(isUploadedImage).nullable(),
  image_alt: z.string(),
  link_url: z.string().refine(isSafeHref).nullable(),
  link_label: z.string(),
  sort_order: z.number().int(),
})

export function toPromotion(row: z.infer<typeof promotionRowSchema>): Promotion {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imagePath: row.image_path,
    imageAlt: row.image_alt,
    linkUrl: row.link_url,
    linkLabel: row.link_label,
    sortOrder: row.sort_order,
  }
}

export function phoneDigits(phone: string) {
  return phone.replace(/\D/g, '')
}

/** `(321) 467-4569` → `tel:+13214674569`; US numbers get the +1 country code. */
export function phoneHref(phone: string) {
  const digits = phoneDigits(phone)
  if (digits.length === 10) return `tel:+1${digits}`
  return `tel:+${digits}`
}

export const contentKeys = ['home_hero', 'contact'] as const
export type ContentKey = (typeof contentKeys)[number]
