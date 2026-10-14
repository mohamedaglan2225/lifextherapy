import type { Field } from './fields'

/**
 * Section catalog. Existing sections render the original components with
 * editable content; templates are the owner-addable building blocks. Design
 * options are limited to presets whose text colours were chosen for readable
 * contrast on every background.
 */

export const BACKGROUNDS = [
  { value: 'ivory', label: 'Ivory (light)' },
  { value: 'ivory-dark', label: 'Sand (light)' },
  { value: 'offwhite', label: 'White' },
  { value: 'charcoal', label: 'Charcoal (dark)' },
] as const

const background: Field = { kind: 'select', name: 'background', label: 'Background', options: BACKGROUNDS }
const eyebrow = (max = 60): Field => ({ kind: 'text', name: 'eyebrow', label: 'Eyebrow', max, hint: 'Small label above the heading.' })
const title = (required = true): Field => ({
  kind: 'display',
  name: 'title',
  label: 'Heading',
  max: 120,
  required,
  hint: 'Press Enter for a line break. Wrap words in *asterisks* for italics.',
})
const intro: Field = { kind: 'textarea', name: 'intro', label: 'Intro text', max: 400, rows: 3 }
const paragraphs = (max = 6): Field => ({
  kind: 'strings',
  name: 'paragraphs',
  label: 'Paragraphs',
  itemLabel: 'Paragraph',
  maxItems: max,
  maxLength: 1200,
  multiline: true,
})
const iconItems = (name: string, label: string, bodyName: string, max: number): Field => ({
  kind: 'list',
  name,
  label,
  itemLabel: 'Item',
  summary: 'title',
  min: 1,
  max,
  fields: [
    { kind: 'icon', name: 'icon', label: 'Icon' },
    { kind: 'text', name: 'title', label: 'Title', max: 80, required: true },
    { kind: 'textarea', name: bodyName, label: 'Text', max: 300, required: true, rows: 2 },
  ],
})

export type SectionType =
  | 'hero'
  | 'page_header'
  | 'trust_bar'
  | 'promotions'
  | 'services_grid'
  | 'philosophy'
  | 'benefits'
  | 'featured_services'
  | 'about_teaser'
  | 'about_story'
  | 'pillars'
  | 'booking_steps'
  | 'faq_preview'
  | 'faq_list'
  | 'contact_details'
  | 'legal_body'
  | 'service_content'
  | 'cta'
  | 'image_text'
  | 'banner'
  | 'cards'
  | 'gallery'
  | 'testimonials'

export type SectionDef = {
  type: SectionType
  label: string
  description: string
  fields: Field[]
  /** At most one per page. */
  singleton?: boolean
  /** Only allowed on these pages (page-specific building blocks). */
  pages?: PageKey[]
  /** Offered in the "Add section" menu as a new building block. */
  template?: boolean
  templateDefaults?: Record<string, unknown>
}

export const PAGE_KEYS = ['home', 'about', 'services', 'contact', 'faq', 'privacy', 'terms', 'service'] as const
export type PageKey = (typeof PAGE_KEYS)[number]

export const SECTION_DEFS: Record<SectionType, SectionDef> = {
  hero: {
    type: 'hero',
    label: 'Hero',
    description: 'Full-screen opening image with headline and booking buttons.',
    singleton: true,
    pages: ['home'],
    fields: [
      eyebrow(80),
      { kind: 'display', name: 'headline', label: 'Headline', max: 120, required: true, hint: 'Up to four lines. Wrap words in *asterisks* for italics.' },
      { kind: 'textarea', name: 'body', label: 'Intro text', max: 300, required: true, rows: 3 },
      { kind: 'image', name: 'image', label: 'Background image', required: true },
      { kind: 'text', name: 'primaryLabel', label: 'Booking button text', max: 40, required: true, hint: 'Always opens your Vagaro booking page.' },
      { kind: 'link', name: 'secondary', label: 'Second button', required: true },
    ],
  },
  page_header: {
    type: 'page_header',
    label: 'Page header',
    description: 'Breadcrumb, page title and introduction at the top of the page.',
    singleton: true,
    pages: ['about', 'services', 'contact', 'faq', 'privacy', 'terms'],
    fields: [
      eyebrow(),
      { kind: 'display', name: 'title', label: 'Page title (H1)', max: 120, required: true, hint: 'Wrap words in *asterisks* for italics.' },
      intro,
      { kind: 'text', name: 'breadcrumb', label: 'Breadcrumb label', max: 60, required: true },
      {
        kind: 'list',
        name: 'actions',
        label: 'Buttons',
        itemLabel: 'Button',
        summary: 'label',
        min: 0,
        max: 2,
        fields: [{ kind: 'button', name: 'button', label: 'Button', required: true }],
      },
    ],
  },
  trust_bar: {
    type: 'trust_bar',
    label: 'Trust bar',
    description: 'Dark band of short reasons to book, with icons.',
    fields: [
      { kind: 'text', name: 'label', label: 'Screen reader label', max: 120, required: true },
      {
        kind: 'list',
        name: 'items',
        label: 'Items',
        itemLabel: 'Item',
        summary: 'title',
        min: 1,
        max: 4,
        fields: [
          { kind: 'icon', name: 'icon', label: 'Icon' },
          { kind: 'text', name: 'title', label: 'Title', max: 60, required: true },
          { kind: 'text', name: 'detail', label: 'Detail', max: 80, required: true },
        ],
      },
    ],
  },
  promotions: {
    type: 'promotions',
    label: 'Promotions',
    description: 'Shows live promotions placed on this page. Hidden automatically when there are none.',
    singleton: true,
    fields: [eyebrow(), title()],
  },
  services_grid: {
    type: 'services_grid',
    label: 'Services grid',
    description: 'Service cards with session lengths, prices and booking buttons.',
    singleton: true,
    fields: [
      eyebrow(),
      { ...title(false), hint: 'Leave empty to show only the cards.' },
      intro,
      {
        kind: 'select',
        name: 'show',
        label: 'Services shown',
        options: [
          { value: 'featured', label: 'Services marked "Show on home page"' },
          { value: 'all', label: 'All active services' },
        ],
      },
      { kind: 'link', name: 'viewAll', label: '"View all" link' },
      { kind: 'toggle', name: 'removeTopSpacing', label: 'Remove top spacing', hint: 'Use directly under a page header.' },
    ],
  },
  philosophy: {
    type: 'philosophy',
    label: 'Image with story',
    description: 'Tall image beside a heading, paragraphs and a link.',
    fields: [
      { kind: 'image', name: 'image', label: 'Image', required: true },
      eyebrow(),
      title(),
      paragraphs(4),
      { kind: 'link', name: 'link', label: 'Link' },
    ],
  },
  benefits: {
    type: 'benefits',
    label: 'Benefits list',
    description: 'Heading beside a list of benefits with icons.',
    fields: [eyebrow(), title(), iconItems('items', 'Benefits', 'body', 8)],
  },
  featured_services: {
    type: 'featured_services',
    label: 'Featured services',
    description: 'Large alternating image and text blocks for chosen services.',
    fields: [
      eyebrow(),
      title(),
      {
        kind: 'list',
        name: 'items',
        label: 'Featured services',
        itemLabel: 'Service',
        summary: 'tagline',
        min: 1,
        max: 6,
        fields: [
          { kind: 'service', name: 'service', label: 'Service', required: true },
          { kind: 'text', name: 'tagline', label: 'Tagline', max: 60, required: true },
          { kind: 'textarea', name: 'description', label: 'Description', max: 500, required: true },
          { kind: 'image', name: 'image', label: 'Image', required: true },
        ],
      },
    ],
  },
  about_teaser: {
    type: 'about_teaser',
    label: 'About preview',
    description: 'Heading beside a short introduction and a link to the About page.',
    fields: [eyebrow(), title(), paragraphs(4), { kind: 'link', name: 'link', label: 'Link', ariaLabel: true }],
  },
  about_story: {
    type: 'about_story',
    label: 'Our story',
    description: 'Story paragraphs beside the therapist portrait.',
    singleton: true,
    fields: [
      eyebrow(),
      title(),
      paragraphs(6),
      { kind: 'image', name: 'portrait', label: 'Portrait', hint: 'Leave empty to show the placeholder card.' },
      { kind: 'text', name: 'portraitPlaceholder', label: 'Placeholder text (no portrait)', max: 80 },
      { kind: 'text', name: 'therapistName', label: 'Therapist name on the card', max: 80 },
      { kind: 'text', name: 'caption', label: 'Caption under the portrait', max: 200 },
    ],
  },
  pillars: {
    type: 'pillars',
    label: 'Approach',
    description: 'Heading and a two-column list of points with icons.',
    fields: [eyebrow(), title(), intro, iconItems('items', 'Points', 'body', 8)],
  },
  booking_steps: {
    type: 'booking_steps',
    label: 'Booking steps',
    description: 'Numbered steps explaining how to book, with a booking button.',
    fields: [
      eyebrow(),
      title(),
      {
        kind: 'list',
        name: 'steps',
        label: 'Steps',
        itemLabel: 'Step',
        summary: 'title',
        min: 1,
        max: 4,
        fields: [
          { kind: 'text', name: 'number', label: 'Number', max: 4, required: true },
          { kind: 'text', name: 'title', label: 'Title', max: 80, required: true },
          { kind: 'textarea', name: 'body', label: 'Text', max: 300, required: true, rows: 2 },
        ],
      },
      { kind: 'text', name: 'buttonLabel', label: 'Booking button text', max: 40, required: true },
    ],
  },
  faq_preview: {
    type: 'faq_preview',
    label: 'FAQ preview',
    description: 'Selected questions in an accordion beside a heading.',
    fields: [
      eyebrow(),
      title(),
      intro,
      {
        kind: 'select',
        name: 'source',
        label: 'Questions shown',
        options: [
          { value: 'home', label: 'Questions marked "Show on home page"' },
          { value: 'services', label: 'Questions marked "Show on service pages"' },
          { value: 'all', label: 'All questions' },
        ],
      },
      { kind: 'link', name: 'viewAll', label: '"View all" link' },
    ],
  },
  faq_list: {
    type: 'faq_list',
    label: 'All questions',
    description: 'Every question grouped by category, then a contact box.',
    singleton: true,
    pages: ['faq'],
    fields: [
      { kind: 'text', name: 'boxTitle', label: 'Contact box heading', max: 80 },
      { kind: 'textarea', name: 'boxBody', label: 'Contact box text', max: 300 },
      { kind: 'link', name: 'boxLink', label: 'Contact box link' },
    ],
  },
  contact_details: {
    type: 'contact_details',
    label: 'Contact details',
    description: 'Phone, email, address, hours and social links from Settings.',
    singleton: true,
    pages: ['contact'],
    fields: [
      eyebrow(),
      title(),
      intro,
      { kind: 'text', name: 'followHeading', label: 'Social links heading', max: 40, required: true },
      { kind: 'text', name: 'hoursHeading', label: 'Hours heading', max: 40, required: true },
      { kind: 'text', name: 'mapText', label: 'Map area text', max: 120 },
      { kind: 'text', name: 'callLabel', label: 'Call button text', max: 30, required: true },
      { kind: 'text', name: 'emailLabel', label: 'Email button text', max: 30, required: true },
      { kind: 'text', name: 'bookLabel', label: 'Booking button text', max: 30, required: true },
    ],
  },
  legal_body: {
    type: 'legal_body',
    label: 'Policy text',
    description: 'The paragraphs of a legal page.',
    singleton: true,
    pages: ['privacy', 'terms'],
    fields: [
      {
        kind: 'strings',
        name: 'paragraphs',
        label: 'Paragraphs',
        itemLabel: 'Paragraph',
        minItems: 1,
        maxItems: 80,
        maxLength: 4000,
        multiline: true,
        hint: 'A paragraph starting with "## " is shown as a subheading.',
      },
    ],
  },
  service_content: {
    type: 'service_content',
    label: 'Service details',
    description: 'Each service page: booking, about, expectations, focus areas, pricing and related services. Content comes from Services; these are the shared headings.',
    singleton: true,
    pages: ['service'],
    fields: [
      { kind: 'text', name: 'bookingLegend', label: 'Session picker label', max: 60, required: true },
      { kind: 'text', name: 'bookingButton', label: 'Booking button text', max: 40, required: true },
      { kind: 'text', name: 'bookingNote', label: 'Booking note', max: 160 },
      { kind: 'text', name: 'aboutEyebrow', label: '"About" eyebrow', max: 60 },
      { kind: 'display', name: 'aboutTitle', label: '"About" heading', max: 80, required: true },
      { kind: 'text', name: 'expectEyebrow', label: '"What to expect" eyebrow', max: 60 },
      { kind: 'display', name: 'expectTitle', label: '"What to expect" heading', max: 80, required: true },
      { kind: 'text', name: 'focusEyebrow', label: '"Focus areas" eyebrow', max: 60 },
      { kind: 'display', name: 'focusTitle', label: '"Focus areas" heading', max: 80, required: true },
      { kind: 'text', name: 'suitabilityEyebrow', label: '"Suitability" eyebrow', max: 60 },
      { kind: 'text', name: 'suitabilityTitle', label: '"Suitability" heading', max: 80, required: true },
      { kind: 'textarea', name: 'suitabilityNote', label: 'Suitability note', max: 300 },
      { kind: 'text', name: 'pricingEyebrow', label: '"Pricing" eyebrow', max: 60 },
      { kind: 'display', name: 'pricingTitle', label: '"Pricing" heading', max: 80, required: true },
      { kind: 'textarea', name: 'pricingIntro', label: 'Pricing text', max: 300 },
      { kind: 'text', name: 'relatedEyebrow', label: '"Related services" eyebrow', max: 60 },
      { kind: 'text', name: 'relatedTitle', label: '"Related services" heading', max: 80, required: true },
    ],
  },
  cta: {
    type: 'cta',
    label: 'Call to action',
    description: 'Full-width image band with a heading and one button.',
    template: true,
    fields: [
      { kind: 'image', name: 'image', label: 'Background image', required: true, decorative: true },
      eyebrow(),
      { kind: 'display', name: 'title', label: 'Heading', max: 120, required: true },
      { kind: 'textarea', name: 'body', label: 'Text', max: 300 },
      { kind: 'button', name: 'button', label: 'Button', required: true },
    ],
    templateDefaults: {
      image: { src: '/images/booking-cta.jpg', alt: '' },
      eyebrow: 'Ready to Begin',
      title: 'Ready to Feel Better?',
      body: 'Choose the massage and session length that works for you and book your appointment online.',
      button: { label: 'Book Your Session', action: 'booking', href: '' },
    },
  },
  image_text: {
    type: 'image_text',
    label: 'Image and text',
    description: 'An image beside a heading, paragraphs and an optional button.',
    template: true,
    fields: [
      background,
      {
        kind: 'select',
        name: 'imagePosition',
        label: 'Image position',
        options: [
          { value: 'left', label: 'Image on the left' },
          { value: 'right', label: 'Image on the right' },
        ],
      },
      { kind: 'image', name: 'image', label: 'Image', hint: 'Optional. Without an image the text is shown on its own.' },
      eyebrow(),
      title(),
      paragraphs(6),
      { kind: 'button', name: 'button', label: 'Button' },
    ],
    templateDefaults: {
      background: 'ivory',
      imagePosition: 'left',
      image: { src: '/images/philosophy.jpg', alt: 'Calm massage therapy room' },
      eyebrow: 'New section',
      title: 'A heading for this section',
      paragraphs: ['Write a short paragraph here.'],
      button: { label: '', action: 'link', href: '' },
    },
  },
  banner: {
    type: 'banner',
    label: 'Banner',
    description: 'A short full-width band with a message and an optional button.',
    template: true,
    fields: [
      background,
      eyebrow(),
      { kind: 'display', name: 'title', label: 'Heading', max: 120, required: true },
      { kind: 'textarea', name: 'body', label: 'Text', max: 300 },
      { kind: 'button', name: 'button', label: 'Button' },
    ],
    templateDefaults: {
      background: 'charcoal',
      eyebrow: '',
      title: 'A short announcement',
      body: '',
      button: { label: '', action: 'link', href: '' },
    },
  },
  cards: {
    type: 'cards',
    label: 'Cards',
    description: 'A grid of cards, each with an optional image, text and link.',
    template: true,
    fields: [
      background,
      eyebrow(),
      title(),
      intro,
      {
        kind: 'select',
        name: 'columns',
        label: 'Columns on large screens',
        options: [
          { value: '2', label: '2 columns' },
          { value: '3', label: '3 columns' },
          { value: '4', label: '4 columns' },
        ],
      },
      {
        kind: 'list',
        name: 'items',
        label: 'Cards',
        itemLabel: 'Card',
        summary: 'title',
        min: 1,
        max: 12,
        fields: [
          { kind: 'image', name: 'image', label: 'Image' },
          { kind: 'text', name: 'title', label: 'Title', max: 80, required: true },
          { kind: 'textarea', name: 'body', label: 'Text', max: 400 },
          { kind: 'link', name: 'link', label: 'Link' },
        ],
      },
    ],
    templateDefaults: {
      background: 'offwhite',
      eyebrow: '',
      title: 'A heading for these cards',
      intro: '',
      columns: '3',
      items: [
        { image: { src: '', alt: '' }, title: 'First card', body: 'Short supporting text.', link: { label: '', href: '' } },
        { image: { src: '', alt: '' }, title: 'Second card', body: 'Short supporting text.', link: { label: '', href: '' } },
        { image: { src: '', alt: '' }, title: 'Third card', body: 'Short supporting text.', link: { label: '', href: '' } },
      ],
    },
  },
  gallery: {
    type: 'gallery',
    label: 'Gallery',
    description: 'A grid of photos with optional captions.',
    template: true,
    fields: [
      background,
      eyebrow(),
      title(false),
      intro,
      {
        kind: 'select',
        name: 'columns',
        label: 'Columns on large screens',
        options: [
          { value: '2', label: '2 columns' },
          { value: '3', label: '3 columns' },
          { value: '4', label: '4 columns' },
        ],
      },
      {
        kind: 'list',
        name: 'images',
        label: 'Photos',
        itemLabel: 'Photo',
        summary: 'caption',
        min: 1,
        max: 24,
        fields: [
          { kind: 'image', name: 'image', label: 'Photo', required: true },
          { kind: 'text', name: 'caption', label: 'Caption', max: 120 },
        ],
      },
    ],
    templateDefaults: {
      background: 'ivory',
      eyebrow: 'Gallery',
      title: 'Inside the studio',
      intro: '',
      columns: '3',
      images: [
        { image: { src: '/images/philosophy.jpg', alt: 'Calm massage therapy room' }, caption: '' },
        { image: { src: '/images/hot-stone.jpg', alt: 'Heated stones on a client’s back' }, caption: '' },
        { image: { src: '/images/swedish.jpg', alt: 'Massage session in a warmly lit room' }, caption: '' },
      ],
    },
  },
  testimonials: {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Client quotes with names.',
    template: true,
    fields: [
      background,
      eyebrow(),
      title(),
      {
        kind: 'list',
        name: 'items',
        label: 'Testimonials',
        itemLabel: 'Testimonial',
        summary: 'name',
        min: 1,
        max: 12,
        fields: [
          { kind: 'textarea', name: 'quote', label: 'Quote', max: 600, required: true, rows: 3 },
          { kind: 'text', name: 'name', label: 'Name', max: 80, required: true },
          { kind: 'text', name: 'detail', label: 'Detail', max: 80, hint: 'For example the treatment or "Client since 2024".' },
        ],
      },
    ],
    templateDefaults: {
      background: 'offwhite',
      eyebrow: 'Kind Words',
      title: 'What clients say',
      items: [{ quote: 'Add a client quote here.', name: 'Client name', detail: '' }],
    },
  },
}

export type PageDef = {
  key: PageKey
  label: string
  path: string
  /** Section types that must exist (once) and cannot be hidden or removed. */
  required: SectionType[]
  /** Section type that must stay at the top of the page. */
  first: SectionType | null
  hasSeo: boolean
  legal?: boolean
}

export const PAGE_DEFS: Record<PageKey, PageDef> = {
  home: { key: 'home', label: 'Home', path: '/', required: ['hero'], first: 'hero', hasSeo: true },
  about: { key: 'about', label: 'About', path: '/about', required: ['page_header'], first: 'page_header', hasSeo: true },
  services: { key: 'services', label: 'Services overview', path: '/services', required: ['page_header', 'services_grid'], first: 'page_header', hasSeo: true },
  contact: { key: 'contact', label: 'Contact', path: '/contact', required: ['page_header', 'contact_details'], first: 'page_header', hasSeo: true },
  faq: { key: 'faq', label: 'FAQ', path: '/faq', required: ['page_header', 'faq_list'], first: 'page_header', hasSeo: true },
  privacy: { key: 'privacy', label: 'Privacy policy', path: '/privacy', required: ['page_header', 'legal_body'], first: 'page_header', hasSeo: true, legal: true },
  terms: { key: 'terms', label: 'Terms', path: '/terms', required: ['page_header', 'legal_body'], first: 'page_header', hasSeo: true, legal: true },
  service: { key: 'service', label: 'Service pages (shared layout)', path: '/services', required: ['service_content'], first: 'service_content', hasSeo: false },
}

export function sectionAllowedOn(def: SectionDef, page: PageKey) {
  return !def.pages || def.pages.includes(page)
}
