import { z } from 'zod'
import { fieldSchema, objectSchema, SLUG_PATTERN, type Field, type ImageValue } from './fields'
import { PAGE_DEFS, PAGE_KEYS, SECTION_DEFS, sectionAllowedOn, type PageKey, type SectionType } from './sections'

/** Content is stored as documents identified by (kind, key). */
export const DOC_KINDS = ['settings', 'page', 'service', 'faqs', 'promotion'] as const
export type DocKind = (typeof DOC_KINDS)[number]

export const SITE_TIME_ZONE = 'America/New_York'

const seoFields: Field[] = [
  { kind: 'text', name: 'title', label: 'SEO title', max: 70, hint: 'Shown in browser tabs and search results. Leave empty to use the default.' },
  { kind: 'textarea', name: 'description', label: 'SEO description', max: 200, rows: 2, hint: 'About 150 characters works best in search results.' },
  { kind: 'image', name: 'shareImage', label: 'Social share image', hint: 'Shown when the page is shared. 1200 × 630 works best. Leave empty for the default.' },
]
export const SEO_FIELDS = seoFields

// ---------------------------------------------------------------- settings

export const SETTINGS_FIELDS: Field[] = [
  { kind: 'text', name: 'siteName', label: 'Site name', max: 60, required: true },
  { kind: 'text', name: 'tagline', label: 'Tagline', max: 80, required: true },
  { kind: 'image', name: 'logo', label: 'Logo', required: true, hint: 'A transparent PNG works best.' },
]
export const CONTACT_FIELDS: Field[] = [
  { kind: 'text', name: 'phone', label: 'Phone', max: 40, required: true },
  { kind: 'text', name: 'email', label: 'Email', max: 254, hint: 'Leave empty to keep the email placeholder.' },
  { kind: 'text', name: 'address', label: 'Address', max: 200, required: true },
]
export const HOURS_FIELD: Field = {
  kind: 'list',
  name: 'hours',
  label: 'Business hours',
  itemLabel: 'Row',
  summary: 'day',
  min: 1,
  max: 7,
  fields: [
    { kind: 'text', name: 'day', label: 'Day or days', max: 40, required: true },
    { kind: 'text', name: 'hours', label: 'Hours', max: 60, required: true },
  ],
}
export const SOCIAL_FIELDS: Field[] = [
  { kind: 'url', name: 'instagramUrl', label: 'Instagram', placeholder: 'https://www.instagram.com/…', hint: 'Leave empty to keep the placeholder icon.' },
  { kind: 'url', name: 'facebookUrl', label: 'Facebook', placeholder: 'https://www.facebook.com/…', hint: 'Leave empty to keep the placeholder icon.' },
]
export const NAVIGATION_FIELD: Field = {
  kind: 'list',
  name: 'navigation',
  label: 'Navigation links',
  itemLabel: 'Link',
  summary: 'label',
  min: 1,
  max: 7,
  fields: [
    { kind: 'text', name: 'label', label: 'Label', max: 30, required: true },
    { kind: 'text', name: 'href', label: 'Link', max: 200, required: true, hint: 'A page on this site such as /about.' },
  ],
}
export const BOOKING_FIELDS: Field[] = [
  { kind: 'url', name: 'businessUrl', label: 'Vagaro booking page', required: true, hint: 'Used by every booking button without a service-specific link.' },
  { kind: 'text', name: 'headerLabel', label: 'Header button text', max: 30, required: true },
  { kind: 'text', name: 'menuLabel', label: 'Mobile menu button text', max: 30, required: true },
  { kind: 'text', name: 'mobileBarLabel', label: 'Mobile bottom bar text', max: 30, required: true },
]
export const FOOTER_FIELDS: Field[] = [
  { kind: 'textarea', name: 'blurb', label: 'Footer text', max: 200, rows: 2 },
  { kind: 'text', name: 'navHeading', label: 'Navigation heading', max: 40, required: true },
  { kind: 'text', name: 'bookHeading', label: 'Booking heading', max: 40, required: true },
  { kind: 'text', name: 'bookLabel', label: 'Booking button text', max: 30, required: true },
  { kind: 'text', name: 'followHeading', label: 'Social links heading', max: 40, required: true },
  {
    kind: 'list',
    name: 'legalLinks',
    label: 'Bottom links',
    itemLabel: 'Link',
    summary: 'label',
    min: 0,
    max: 4,
    fields: [
      { kind: 'text', name: 'label', label: 'Label', max: 40, required: true },
      { kind: 'text', name: 'href', label: 'Link', max: 200, required: true },
    ],
  },
]
export const DEFAULT_SEO_FIELDS: Field[] = [
  { kind: 'text', name: 'defaultTitle', label: 'Default title', max: 80, required: true, hint: 'Used for the home page and any page without its own title.' },
  { kind: 'textarea', name: 'description', label: 'Default description', max: 200, required: true, rows: 2 },
  { kind: 'image', name: 'shareImage', label: 'Default social share image', hint: 'Leave empty to use the generated image with the site name.' },
]

const internalPath = (label: string) =>
  z
    .string()
    .trim()
    .max(200)
    .refine((value) => /^\/[a-z0-9\-/]*$/.test(value) && !value.startsWith('//'), `${label} must be a page on this site, such as /about.`)

export const settingsSchema = objectSchema(SETTINGS_FIELDS).extend({
  contact: objectSchema(CONTACT_FIELDS).superRefine((value, ctx) => {
    if ((value.phone as string).replace(/\D/g, '').length < 7)
      ctx.addIssue({ code: 'custom', message: 'Enter a phone number with at least 7 digits.', path: ['phone'] })
    if (value.email && !z.email().safeParse(value.email).success)
      ctx.addIssue({ code: 'custom', message: 'Enter a valid email address, or leave it empty.', path: ['email'] })
  }),
  hours: fieldSchema(HOURS_FIELD),
  social: objectSchema(SOCIAL_FIELDS),
  navigation: z
    .array(z.object({ label: z.string().trim().min(1, 'Label is required.').max(30), href: internalPath('Link') }))
    .min(1)
    .max(7),
  booking: objectSchema(BOOKING_FIELDS),
  footer: objectSchema(FOOTER_FIELDS.filter((field) => field.name !== 'legalLinks')).extend({
    legalLinks: z.array(z.object({ label: z.string().trim().min(1).max(40), href: internalPath('Link') })).max(4),
  }),
  seo: objectSchema(DEFAULT_SEO_FIELDS),
})
type NavItem = { label: string; href: string }
export type Settings = {
  siteName: string
  tagline: string
  logo: ImageValue
  contact: { phone: string; email: string; address: string }
  hours: Array<{ day: string; hours: string }>
  social: { instagramUrl: string; facebookUrl: string }
  navigation: NavItem[]
  booking: { businessUrl: string; headerLabel: string; menuLabel: string; mobileBarLabel: string }
  footer: { blurb: string; navHeading: string; bookHeading: string; bookLabel: string; followHeading: string; legalLinks: NavItem[] }
  seo: { defaultTitle: string; description: string; shareImage: ImageValue }
}

// ---------------------------------------------------------------- pages

const sectionTypes = Object.keys(SECTION_DEFS) as [SectionType, ...SectionType[]]
const sectionDataSchemas = Object.fromEntries(
  sectionTypes.map((type) => [type, objectSchema(SECTION_DEFS[type].fields)]),
) as unknown as Record<SectionType, z.ZodType<Record<string, unknown>>>

export const sectionSchema = z
  .object({
    id: z.uuid('Invalid section id.'),
    type: z.enum(sectionTypes),
    hidden: z.boolean(),
    data: z.unknown(),
  })
  .transform((section, ctx) => {
    const parsed = sectionDataSchemas[section.type].safeParse(section.data)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) ctx.addIssue({ ...issue, path: ['data', ...issue.path] } as never)
      return z.NEVER
    }
    return { ...section, data: parsed.data }
  })
export type Section = { id: string; type: SectionType; hidden: boolean; data: Record<string, unknown> }

export function pageSchema(key: PageKey) {
  const def = PAGE_DEFS[key]
  return z
    .object({
      seo: objectSchema(seoFields),
      indexable: z.boolean(),
      sections: z.array(sectionSchema).max(30, 'A page can have at most 30 sections.'),
    })
    .superRefine((page, ctx) => {
      const sections = page.sections as Section[]
      const ids = new Set<string>()
      sections.forEach((section, index) => {
        const sectionDef = SECTION_DEFS[section.type]
        if (ids.has(section.id)) ctx.addIssue({ code: 'custom', message: 'Duplicate section id.', path: ['sections', index] })
        ids.add(section.id)
        if (!sectionAllowedOn(sectionDef, key))
          ctx.addIssue({ code: 'custom', message: `"${sectionDef.label}" cannot be used on this page.`, path: ['sections', index] })
        if (sectionDef.singleton && sections.filter((other) => other.type === section.type).length > 1)
          ctx.addIssue({ code: 'custom', message: `Only one "${sectionDef.label}" section is allowed.`, path: ['sections', index] })
      })
      for (const type of def.required) {
        const found = sections.find((section) => section.type === type)
        if (!found) ctx.addIssue({ code: 'custom', message: `This page needs its "${SECTION_DEFS[type].label}" section.`, path: ['sections'] })
        else if (found.hidden)
          ctx.addIssue({ code: 'custom', message: `"${SECTION_DEFS[type].label}" is required and cannot be hidden.`, path: ['sections', sections.indexOf(found)] })
      }
      if (def.first && sections[0]?.type !== def.first)
        ctx.addIssue({ code: 'custom', message: `"${SECTION_DEFS[def.first].label}" must stay at the top of the page.`, path: ['sections'] })
    })
}
export type PageDoc = { seo: { title: string; description: string; shareImage: { src: string; alt: string } }; indexable: boolean; sections: Section[] }

// ---------------------------------------------------------------- services

export const SERVICE_FIELDS: Field[] = [
  { kind: 'text', name: 'name', label: 'Name', max: 80, required: true },
  { kind: 'text', name: 'shortName', label: 'Short name', max: 30, required: true, hint: 'Used on buttons, for example "Book Hot Stone".' },
  { kind: 'textarea', name: 'intro', label: 'Lead sentence', max: 300, required: true, rows: 2, hint: 'Shown large at the top of the service page.' },
  { kind: 'textarea', name: 'description', label: 'Description', max: 400, required: true, rows: 3, hint: 'Shown on service cards and the service page.' },
  { kind: 'image', name: 'image', label: 'Card image', required: true },
  { kind: 'image', name: 'editorialImage', label: 'Wide image on the service page', required: true },
  { kind: 'strings', name: 'about', label: 'About this massage', itemLabel: 'Paragraph', minItems: 1, maxItems: 6, maxLength: 1200, multiline: true },
  { kind: 'strings', name: 'whatToExpect', label: 'What to expect', itemLabel: 'Step', minItems: 1, maxItems: 8, maxLength: 600, multiline: true },
  {
    kind: 'list',
    name: 'focusAreas',
    label: 'Focus areas',
    itemLabel: 'Focus area',
    summary: 'title',
    min: 1,
    max: 8,
    fields: [
      { kind: 'text', name: 'title', label: 'Title', max: 80, required: true },
      { kind: 'textarea', name: 'body', label: 'Text', max: 300, required: true, rows: 2 },
    ],
  },
  { kind: 'strings', name: 'suitableFor', label: 'Who it may suit', itemLabel: 'Point', minItems: 1, maxItems: 10, maxLength: 160 },
  { kind: 'toggle', name: 'featuredOnHome', label: 'Show on home page', hint: 'Shown in the home page services grid.' },
]
export const SESSIONS_FIELD: Field = {
  kind: 'list',
  name: 'sessions',
  label: 'Sessions',
  itemLabel: 'Session',
  summary: 'minutes',
  min: 1,
  max: 6,
  fields: [
    { kind: 'number', name: 'minutes', label: 'Length', min: 15, max: 240, suffix: 'min' },
    { kind: 'number', name: 'price', label: 'Price', min: 0, max: 5000, prefix: '$' },
    { kind: 'url', name: 'vagaroUrl', label: 'Vagaro link for this session', hint: 'Leave empty to use your main Vagaro booking page.' },
  ],
}

export const serviceSchema = objectSchema(SERVICE_FIELDS)
  .extend({
    slug: z.string().trim().regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens, such as "hot-stone-massage".').max(80),
    previousSlugs: z.array(z.string().regex(SLUG_PATTERN)).max(20),
    status: z.enum(['active', 'archived']),
    sortOrder: z.number().int().min(0).max(999),
    sessions: fieldSchema(SESSIONS_FIELD),
    seo: objectSchema(seoFields),
  })
  .superRefine((service, ctx) => {
    const minutes = (service.sessions as Array<{ minutes: number }>).map((session) => session.minutes)
    if (new Set(minutes).size !== minutes.length)
      ctx.addIssue({ code: 'custom', message: 'Each session length can only be listed once.', path: ['sessions'] })
    if ((service.previousSlugs as string[]).includes(service.slug as string))
      ctx.addIssue({ code: 'custom', message: 'The address cannot also be one of its old addresses.', path: ['slug'] })
    const vagaro = (service.sessions as Array<{ vagaroUrl: string }>).find(
      (session) => session.vagaroUrl && !/^https:\/\/(www\.)?vagaro\.com\//.test(session.vagaroUrl),
    )
    if (vagaro) ctx.addIssue({ code: 'custom', message: 'Session booking links must be vagaro.com links.', path: ['sessions'] })
  })
export type ServiceDoc = {
  slug: string
  previousSlugs: string[]
  status: 'active' | 'archived'
  sortOrder: number
  name: string
  shortName: string
  intro: string
  description: string
  image: { src: string; alt: string }
  editorialImage: { src: string; alt: string }
  about: string[]
  whatToExpect: string[]
  focusAreas: Array<{ title: string; body: string }>
  suitableFor: string[]
  featuredOnHome: boolean
  sessions: Array<{ minutes: number; price: number; vagaroUrl: string }>
  seo: PageDoc['seo']
}

// ---------------------------------------------------------------- FAQs

export const faqsSchema = z
  .object({
    categories: z.array(z.string().trim().min(1, 'Category names cannot be empty.').max(60)).min(1).max(12),
    items: z
      .array(
        z.object({
          id: z.uuid(),
          question: z.string().trim().min(1, 'Question is required.').max(200),
          answer: z.string().trim().min(1, 'Answer is required.').max(2000),
          category: z.string().trim(),
          showOnHome: z.boolean(),
          showOnServices: z.boolean(),
        }),
      )
      .max(80),
  })
  .superRefine((faqs, ctx) => {
    if (new Set(faqs.categories).size !== faqs.categories.length)
      ctx.addIssue({ code: 'custom', message: 'Category names must be unique.', path: ['categories'] })
    faqs.items.forEach((item, index) => {
      if (!faqs.categories.includes(item.category))
        ctx.addIssue({ code: 'custom', message: 'Choose one of the categories.', path: ['items', index, 'category'] })
    })
  })
export type FaqsDoc = z.output<typeof faqsSchema>

// ---------------------------------------------------------------- promotions

export const PROMOTION_FIELDS: Field[] = [
  { kind: 'text', name: 'title', label: 'Title', max: 120, required: true },
  { kind: 'textarea', name: 'description', label: 'Description', max: 600, rows: 4 },
  { kind: 'image', name: 'image', label: 'Image' },
  { kind: 'link', name: 'link', label: 'Button', hint: 'Optional. For example /services or a Vagaro link.' },
]
const isoOrEmpty = z
  .string()
  .trim()
  .refine((value) => value === '' || !Number.isNaN(Date.parse(value)), 'Enter a valid date and time.')

export const promotionSchema = objectSchema(PROMOTION_FIELDS)
  .extend({
    placements: z.array(z.enum(PAGE_KEYS)).min(1, 'Choose at least one page.').max(PAGE_KEYS.length),
    startsAt: isoOrEmpty,
    endsAt: isoOrEmpty,
    sortOrder: z.number().int().min(0).max(999),
  })
  .superRefine((promotion, ctx) => {
    const startsAt = promotion.startsAt as string
    const endsAt = promotion.endsAt as string
    if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt))
      ctx.addIssue({ code: 'custom', message: 'The end must be after the start.', path: ['endsAt'] })
    if ((promotion.placements as string[]).includes('service'))
      ctx.addIssue({ code: 'custom', message: 'Promotions cannot be placed on the shared service layout.', path: ['placements'] })
  })
export type PromotionDoc = {
  title: string
  description: string
  image: { src: string; alt: string }
  link: { label: string; href: string }
  placements: PageKey[]
  startsAt: string
  endsAt: string
  sortOrder: number
}

/** Whether a promotion is inside its schedule at `now`. */
export function isPromotionActive(promotion: Pick<PromotionDoc, 'startsAt' | 'endsAt'>, now = Date.now()) {
  if (promotion.startsAt && Date.parse(promotion.startsAt) > now) return false
  if (promotion.endsAt && Date.parse(promotion.endsAt) <= now) return false
  return true
}

// ---------------------------------------------------------------- dispatch

export function schemaFor(kind: DocKind, key: string): z.ZodType {
  switch (kind) {
    case 'settings':
      return settingsSchema
    case 'page':
      return pageSchema(key as PageKey)
    case 'service':
      return serviceSchema
    case 'faqs':
      return faqsSchema
    case 'promotion':
      return promotionSchema
  }
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export function isValidDocKey(kind: DocKind, key: string) {
  switch (kind) {
    case 'settings':
      return key === 'site'
    case 'page':
      return (PAGE_KEYS as readonly string[]).includes(key)
    case 'faqs':
      return key === 'all'
    case 'service':
    case 'promotion':
      return UUID_PATTERN.test(key)
  }
}
