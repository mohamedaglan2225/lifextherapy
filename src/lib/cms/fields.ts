import { z } from 'zod'

/**
 * Declarative field specs. One spec drives three things: the dashboard form,
 * server-side validation, and re-validation of published data on read. Zod
 * objects strip unknown keys, so stored content only ever contains declared
 * fields.
 */

export const ICON_NAMES = [
  'heart',
  'clock',
  'calendar',
  'shield',
  'sun',
  'activity',
  'phone',
  'mail',
  'pin',
  'plus',
  'instagram',
  'facebook',
] as const

/** Uploaded media is always stored as `<uuid>.<ext>` at the bucket root. */
export const UPLOADED_IMAGE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$/
export const UPLOADED_IMAGE_GLOBAL =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp|avif)/g

/** Images bundled with the site in `public/images`. */
export const STATIC_IMAGE_PATTERN = /^\/images\/[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp)$/

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isUploadedImage(value: string) {
  return UPLOADED_IMAGE_PATTERN.test(value)
}

/** https URLs, or same-site paths such as `/services` (never `//host` or `/\host`). */
export function isSafeHref(value: string) {
  if (value.startsWith('/')) return !/^\/[/\\]/.test(value) && !/[\s\\]/.test(value)
  return isHttpsUrl(value)
}

export function isHttpsUrl(value: string) {
  if (/[\s\\]/.test(value)) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

type Base = { name: string; label: string; hint?: string }

export type Field =
  | (Base & { kind: 'text'; max: number; required?: boolean; placeholder?: string })
  | (Base & { kind: 'textarea'; max: number; required?: boolean; rows?: number })
  /** Headings: each line break becomes a line break, `*words*` become italic. */
  | (Base & { kind: 'display'; max: number; required?: boolean })
  | (Base & { kind: 'strings'; maxItems: number; minItems?: number; maxLength: number; multiline?: boolean; itemLabel: string })
  | (Base & { kind: 'link'; required?: boolean; ariaLabel?: boolean })
  | (Base & { kind: 'button'; required?: boolean })
  | (Base & { kind: 'image'; required?: boolean; decorative?: boolean })
  | (Base & { kind: 'select'; options: ReadonlyArray<{ value: string; label: string }> })
  | (Base & { kind: 'toggle' })
  | (Base & { kind: 'number'; min: number; max: number; prefix?: string; suffix?: string })
  | (Base & { kind: 'icon' })
  | (Base & { kind: 'service'; required?: boolean })
  | (Base & { kind: 'url'; required?: boolean; placeholder?: string })
  | (Base & { kind: 'list'; itemLabel: string; summary: string; min: number; max: number; fields: Field[] })

export type ImageValue = { src: string; alt: string; width?: number; height?: number }
export type LinkValue = { label: string; href: string; ariaLabel?: string }
export type ButtonValue = { label: string; action: 'booking' | 'link'; href: string }

const imageSrc = z
  .string()
  .trim()
  .max(200)
  .refine((value) => value === '' || STATIC_IMAGE_PATTERN.test(value) || isUploadedImage(value), 'Choose an image from the media library.')

function textSchema(label: string, max: number, required?: boolean) {
  const base = z.string().trim().max(max, `${label} must be ${max} characters or fewer.`)
  return required ? base.min(1, `${label} is required.`) : base
}

export function fieldSchema(field: Field): z.ZodType {
  switch (field.kind) {
    case 'text':
    case 'textarea':
      return textSchema(field.label, field.max, field.required)
    case 'display':
      return textSchema(field.label, field.max, field.required).refine(
        (value) => value.split('\n').length <= 4,
        `${field.label} can have at most four lines.`,
      )
    case 'strings': {
      const item = z
        .string()
        .trim()
        .min(1, `Remove empty ${field.itemLabel.toLowerCase()} entries.`)
        .max(field.maxLength, `Each ${field.itemLabel.toLowerCase()} must be ${field.maxLength} characters or fewer.`)
      return z
        .array(item)
        .min(field.minItems ?? 0, `Add at least ${field.minItems} ${field.itemLabel.toLowerCase()}.`)
        .max(field.maxItems, `Use at most ${field.maxItems} entries.`)
    }
    case 'link':
      return z
        .object({ label: z.string().trim().max(80), href: z.string().trim().max(500), ariaLabel: z.string().trim().max(120).optional() })
        .superRefine((value, ctx) => {
          if (!value.label && !value.href) {
            if (field.required) ctx.addIssue({ code: 'custom', message: `${field.label} needs text and a link.` })
            return
          }
          if (!value.label) ctx.addIssue({ code: 'custom', message: `${field.label} needs link text.`, path: ['label'] })
          if (!isSafeHref(value.href))
            ctx.addIssue({ code: 'custom', message: 'Use a page on this site (such as /services) or a full https:// address.', path: ['href'] })
        })
    case 'button':
      return z
        .object({ label: z.string().trim().max(60), action: z.enum(['booking', 'link']), href: z.string().trim().max(500) })
        .superRefine((value, ctx) => {
          if (!value.label) {
            if (field.required) ctx.addIssue({ code: 'custom', message: `${field.label} needs button text.`, path: ['label'] })
            return
          }
          if (value.action === 'link' && !isSafeHref(value.href))
            ctx.addIssue({ code: 'custom', message: 'Use a page on this site (such as /services) or a full https:// address.', path: ['href'] })
        })
        .transform((value) => (value.action === 'booking' ? { ...value, href: '' } : value))
    case 'image':
      return z
        .object({
          src: imageSrc,
          alt: z.string().trim().max(200, 'Image descriptions must be 200 characters or fewer.'),
          width: z.number().int().positive().max(20000).optional(),
          height: z.number().int().positive().max(20000).optional(),
        })
        .superRefine((value, ctx) => {
          if (!value.src) {
            if (field.required) ctx.addIssue({ code: 'custom', message: `${field.label}: choose an image.`, path: ['src'] })
            return
          }
          if (!field.decorative && !value.alt)
            ctx.addIssue({ code: 'custom', message: 'Describe the image for visitors using screen readers.', path: ['alt'] })
        })
        .transform((value) => (field.decorative ? { ...value, alt: '' } : value))
    case 'select':
      return z.enum(field.options.map((option) => option.value) as [string, ...string[]])
    case 'toggle':
      return z.boolean()
    case 'number':
      return z
        .number({ error: `${field.label} must be a number.` })
        .int(`${field.label} must be a whole number.`)
        .min(field.min, `${field.label} must be at least ${field.min}.`)
        .max(field.max, `${field.label} must be at most ${field.max}.`)
    case 'icon':
      return z.enum(ICON_NAMES)
    case 'service':
      return z
        .string()
        .trim()
        .refine((value) => (value === '' ? !field.required : SLUG_PATTERN.test(value)), 'Choose a service.')
    case 'url':
      return z
        .string()
        .trim()
        .max(500)
        .refine((value) => (value === '' ? !field.required : isHttpsUrl(value)), `${field.label} must be a full https:// address.`)
    case 'list':
      return z
        .array(objectSchema(field.fields))
        .min(field.min, `Add at least ${field.min} ${field.itemLabel.toLowerCase()}${field.min === 1 ? '' : 's'}.`)
        .max(field.max, `Use at most ${field.max} ${field.itemLabel.toLowerCase()}s.`)
  }
}

export function objectSchema(fields: Field[]) {
  return z.object(Object.fromEntries(fields.map((field) => [field.name, fieldSchema(field)])))
}

/** Empty value for a field, used when adding list items or new sections. */
export function emptyValue(field: Field): unknown {
  switch (field.kind) {
    case 'text':
    case 'textarea':
    case 'display':
    case 'service':
    case 'url':
      return ''
    case 'strings':
      return []
    case 'link':
      return { label: '', href: '', ...(field.ariaLabel ? { ariaLabel: '' } : {}) }
    case 'button':
      return { label: '', action: 'link', href: '' }
    case 'image':
      return { src: '', alt: '' }
    case 'select':
      return field.options[0].value
    case 'toggle':
      return false
    case 'number':
      return field.min
    case 'icon':
      return 'heart'
    case 'list':
      return Array.from({ length: field.min }, () => emptyObject(field.fields))
  }
}

export function emptyObject(fields: Field[]) {
  return Object.fromEntries(fields.map((field) => [field.name, emptyValue(field)]))
}

/** Every uploaded image path referenced anywhere in a document. */
export function uploadedImagePaths(data: unknown): string[] {
  return [...new Set(JSON.stringify(data).match(UPLOADED_IMAGE_GLOBAL) ?? [])]
}
