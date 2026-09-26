import type { IconName } from '@/components/ui/Icon'

export type TrustItem = {
  icon: IconName
  title: string
  detail: string
}

export const trustItems: TrustItem[] = [
  {
    icon: 'heart',
    title: 'Personalized Sessions',
    detail: 'Tailored to your body and goals',
  },
  {
    icon: 'clock',
    title: 'Flexible Session Lengths',
    detail: '60, 90, or 120 minute options',
  },
  {
    icon: 'calendar',
    title: 'Easy Online Booking',
    detail: 'Schedule through Vagaro anytime',
  },
  {
    icon: 'shield',
    title: 'Professional Bodywork',
    detail: 'Comfort-focused, evidence-informed care',
  },
]

export type Benefit = {
  icon: IconName
  title: string
  body: string
}

export const benefits: Benefit[] = [
  {
    icon: 'sun',
    title: 'Personalized Sessions',
    body: 'Each session is shaped around your comfort, your goals, and how you feel that day.',
  },
  {
    icon: 'heart',
    title: 'Comfort-Focused Care',
    body: 'Your experience and well-being guide every decision made during the session.',
  },
  {
    icon: 'activity',
    title: 'Multiple Techniques',
    body: 'Swedish, therapeutic, deep tissue, hot stone, sports massage, and prenatal care.',
  },
  {
    icon: 'clock',
    title: 'Flexible Session Lengths',
    body: 'Choose from 60, 90, or 120 minute sessions depending on your needs and schedule.',
  },
  {
    icon: 'calendar',
    title: 'Easy Online Booking',
    body: 'Schedule and pay through Vagaro at any time, from any device.',
  },
]

export type FeaturedService = {
  /** Matches a slug in the service catalog so pricing stays in one place. */
  slug: string
  tagline: string
  description: string
  image: string
  imageAlt: string
}

export const featuredServices: FeaturedService[] = [
  {
    slug: 'therapeutic-massage',
    tagline: 'Built Around Your Body',
    description:
      'Targeted bodywork that listens. Therapeutic massage goes beyond relaxation — working into the areas that need attention most, adapting pressure and technique to your specific patterns of tension.',
    image: '/images/deep-pressure.jpg',
    imageAlt: 'Therapeutic massage session focused on the upper back',
  },
  {
    slug: 'deep-tissue-massage',
    tagline: 'For Persistent Tension',
    description:
      "Reaching deeper layers of muscle and connective tissue with deliberate, sustained pressure. Ideal for chronic tension, postural patterns, and areas that haven't responded to lighter work.",
    image: '/images/deep-tissue.jpg',
    imageAlt: 'Therapist working deeply along a client’s leg',
  },
  {
    slug: 'hot-stone-massage',
    tagline: 'Warmth That Reaches Deep',
    description:
      'Heated stones melt tension in a way hands alone cannot. A profoundly calming experience that combines the warmth of volcanic basalt stones with skilled massage technique.',
    image: '/images/hot-stone.jpg',
    imageAlt: 'Hot stone massage with heated stones resting on the back',
  },
]

export type BookingStep = {
  number: string
  title: string
  body: string
}

export const bookingSteps: BookingStep[] = [
  {
    number: '01',
    title: 'Choose Your Massage',
    body: 'Browse our services and select the massage type that best fits your needs.',
  },
  {
    number: '02',
    title: 'Choose Your Session Length',
    body: 'Select a 60, 90, or 120 minute session depending on what your body needs.',
  },
  {
    number: '03',
    title: 'Book Through Vagaro',
    body: 'Complete your booking and payment securely online through Vagaro.',
  },
]

export const faqCategories = [
  'Before Your Session',
  'During Your Session',
  'Booking',
  'Massage Services',
] as const

export type FaqCategory = (typeof faqCategories)[number]

export type Faq = {
  question: string
  answer: string
  category: FaqCategory
}

export const faqs: Faq[] = [
  {
    question: 'What should I expect during my first session?',
    answer:
      "Your therapist will begin with a brief consultation to understand your goals, any areas of concern, and your preferences for pressure and focus. You'll be given privacy to undress to your comfort level and settle onto the table. The session will be adapted to your feedback throughout.",
    category: 'Before Your Session',
  },
  {
    question: 'Which massage should I choose?',
    answer:
      "If you're looking for relaxation and general tension relief, Swedish massage is a great starting point. For specific muscle tension or postural discomfort, Therapeutic or Deep Tissue may be more appropriate. If you're active or training regularly, Sports Massage could be ideal. Your therapist can also help guide you during your consultation.",
    category: 'Massage Services',
  },
  {
    question: 'How long should my session be?',
    answer:
      'A 60-minute session works well for focused work on specific areas or a lighter relaxation session. 90 minutes allows time to address multiple areas more thoroughly. 120 minutes is ideal for a full-body treatment with additional attention to areas of concern.',
    category: 'Massage Services',
  },
  {
    question: 'What should I wear?',
    answer:
      'Undress to your comfort level. You will be professionally draped throughout the session, with only the area being worked on exposed. Comfort and privacy are always the priority.',
    category: 'During Your Session',
  },
  {
    question: 'How do I book an appointment?',
    answer:
      'Appointments are booked through Vagaro, our online booking and payment system. Select your massage type, session length, and preferred time. You can book at any time through the Book Now button on this page.',
    category: 'Booking',
  },
  {
    question: 'Can I reschedule my appointment?',
    answer:
      '[Rescheduling policy placeholder — update with your specific cancellation and rescheduling window, such as 24 or 48 hours notice required.]',
    category: 'Booking',
  },
  {
    question: 'Is pregnancy massage available?',
    answer:
      'Yes. Pregnancy massage is available for expectant mothers and is designed specifically around the comfort and needs of prenatal clients. Please inform your therapist of your pregnancy and how far along you are when booking.',
    category: 'Massage Services',
  },
]

/** Three questions used for the home page preview. */
export const homeFaqs = faqs.filter((faq) =>
  [
    'What should I expect during my first session?',
    'Which massage should I choose?',
    'How do I book an appointment?',
  ].includes(faq.question),
)

/** Questions relevant to booking a session, reused on every service page. */
export const sessionFaqs = faqs.filter(
  (faq) => faq.category === 'Booking' || faq.category === 'Before Your Session',
)

export function faqsByCategory(): Array<{ category: FaqCategory; items: Faq[] }> {
  return faqCategories
    .map((category) => ({ category, items: faqs.filter((faq) => faq.category === category) }))
    .filter((group) => group.items.length > 0)
}

export type ApproachPillar = {
  icon: IconName
  title: string
  body: string
}

export const approachPillars: ApproachPillar[] = [
  {
    icon: 'heart',
    title: 'We start by listening',
    body: 'Every session opens with a conversation about how you are feeling that day, what you would like attention on, and the pressure you prefer.',
  },
  {
    icon: 'sun',
    title: 'Sessions are individual',
    body: 'No two bodies hold tension the same way, so the work is shaped around you rather than following a fixed routine.',
  },
  {
    icon: 'shield',
    title: 'Comfort guides the work',
    body: 'Positioning, draping and pressure are all set to what feels right for you, and adjusted the moment you ask.',
  },
  {
    icon: 'clock',
    title: 'A calm environment',
    body: 'A quiet, unhurried room with time set aside so that nothing about the session feels rushed.',
  },
]
