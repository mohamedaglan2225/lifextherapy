export type SessionLength = {
  minutes: number
  price: number
}

export type FocusArea = {
  title: string
  body: string
}

export type Service = {
  slug: string
  name: string
  /** Used for compact CTAs, e.g. "Book Hot Stone". */
  shortName: string
  /** Catalog copy supplied by the business. */
  description: string
  /** One-line lead used on the service page hero. */
  intro: string
  sessions: SessionLength[]
  /** Card image used in the catalog grid. */
  image: string
  imageAlt: string
  /** Larger image used once on the service page. Reuses the existing asset pool. */
  editorialImage: string
  editorialImageAlt: string
  about: string[]
  whatToExpect: string[]
  focusAreas: FocusArea[]
  suitableFor: string[]
  metaDescription: string
  /** Curated subset shown in the home page preview. */
  featuredOnHome: boolean
}

export const services: Service[] = [
  {
    slug: 'swedish-massage',
    name: 'Swedish Massage',
    shortName: 'Swedish',
    description:
      'A soothing massage designed to alleviate tension, improve circulation, and encourage deep relaxation.',
    intro:
      'Classic, flowing bodywork at a pressure that stays comfortable from start to finish — the most familiar place to begin.',
    sessions: [
      { minutes: 60, price: 85 },
      { minutes: 90, price: 115 },
      { minutes: 120, price: 140 },
    ],
    image: '/images/swedish.jpg',
    imageAlt: 'Swedish massage session in a warmly lit treatment room',
    editorialImage: '/images/philosophy.jpg',
    editorialImageAlt: 'Calm, softly lit massage therapy room prepared for a session',
    about: [
      'Swedish massage is the most widely recognised form of classical massage — long, flowing strokes worked over the surface layers of muscle at a steady, even pace.',
      'It is often the starting point for anyone new to bodywork, and a familiar choice for people who simply want an uninterrupted hour or two of rest.',
    ],
    whatToExpect: [
      'A short conversation at the start of the session about how you are feeling, where you would like attention, and the pressure you prefer.',
      'Broad, rhythmic strokes across the back, shoulders, arms and legs, with the pace kept slow and consistent.',
      'Pressure adjusted whenever you ask — you are welcome to speak up at any point and the work changes with you.',
    ],
    focusAreas: [
      {
        title: 'Full-body rest',
        body: 'The session moves across the whole body rather than concentrating on a single area.',
      },
      {
        title: 'Everyday tension',
        body: 'Attention to the shoulders, neck and lower back, where day-to-day tension tends to gather.',
      },
      {
        title: 'Comfortable pressure',
        body: 'Lighter to moderate pressure throughout, set to what feels right for you on the day.',
      },
    ],
    suitableFor: [
      'Booking your first massage',
      'Long stretches at a desk or behind the wheel',
      'Winding down after a demanding week',
      'Preferring lighter, steadier pressure',
    ],
    metaDescription:
      'Swedish massage at Life X Therapy — soothing, flowing bodywork in 60, 90 or 120 minute sessions from $85. Book online through Vagaro.',
    featuredOnHome: true,
  },
  {
    slug: 'therapeutic-massage',
    name: 'Therapeutic Massage',
    shortName: 'Therapeutic',
    description:
      "Targeted bodywork designed to address sore muscles and stubborn tension, personalized around your body's needs.",
    intro:
      'Targeted bodywork that adapts as it goes — pressure and technique shaped around the areas asking for attention.',
    sessions: [
      { minutes: 60, price: 90 },
      { minutes: 90, price: 120 },
      { minutes: 120, price: 145 },
    ],
    image: '/images/hero-massage.jpg',
    imageAlt: 'Therapist applying targeted pressure during a therapeutic massage',
    editorialImage: '/images/deep-pressure.jpg',
    editorialImageAlt: 'Therapist working along a client’s upper back and shoulders',
    about: [
      'Therapeutic massage sits between relaxation work and focused treatment. The session still flows, but more of it is spent on the areas you point to at the start.',
      'Technique and pressure are chosen as the work goes on, based on what the tissue responds to and on the feedback you give during the session.',
    ],
    whatToExpect: [
      'A longer opening conversation about the areas you would like worked on and anything that feels restricted or sore.',
      'A mix of broader strokes and slower, more specific work over the areas you identified.',
      'Regular check-ins on pressure, so the session stays within a range that feels productive rather than uncomfortable.',
    ],
    focusAreas: [
      {
        title: 'Specific areas',
        body: 'Time concentrated on the regions you raise rather than spread evenly across the body.',
      },
      {
        title: 'Stubborn tension',
        body: 'Slower, more sustained work over areas that have not eased with lighter massage.',
      },
      {
        title: 'Adjusted as you go',
        body: 'Pressure and technique change through the session in response to your feedback.',
      },
    ],
    suitableFor: [
      'Tension concentrated in one or two areas',
      'Returning clients who want more focused work',
      'Desk posture and repetitive daily movement',
      'Anyone between relaxation and deep tissue pressure',
    ],
    metaDescription:
      'Therapeutic massage at Life X Therapy — targeted bodywork personalized to your body, in 60, 90 or 120 minute sessions from $90. Book online through Vagaro.',
    featuredOnHome: true,
  },
  {
    slug: 'pregnancy-massage',
    name: 'Pregnancy Massage',
    shortName: 'Pregnancy',
    description:
      'A specialized prenatal massage designed around the needs and comfort of expectant mothers, promoting relaxation and easing common pregnancy-related muscle tension.',
    intro:
      'Prenatal bodywork arranged around your comfort, with positioning and support adjusted to where you are in your pregnancy.',
    sessions: [
      { minutes: 60, price: 85 },
      { minutes: 90, price: 115 },
    ],
    image: '/images/pregnancy.jpg',
    imageAlt: 'Expectant mother resting comfortably during a prenatal massage',
    editorialImage: '/images/philosophy.jpg',
    editorialImageAlt: 'Quiet treatment room with soft natural light',
    about: [
      'Pregnancy massage is arranged around comfort first. Positioning, bolstering and pressure are all set up for how your body feels on the day of the session.',
      'The work stays gentle and unhurried, with attention to the areas that commonly carry tension as posture changes through pregnancy.',
    ],
    whatToExpect: [
      'A conversation at the start about how far along you are, how you have been feeling, and any positions you find comfortable or would rather avoid.',
      'Side-lying or supported positioning with cushions and bolsters arranged before the work begins.',
      'Gentle, steady pressure, with the session paused or repositioned whenever you would like.',
    ],
    focusAreas: [
      {
        title: 'Supported positioning',
        body: 'Bolsters and cushions set up so you can settle without holding yourself in place.',
      },
      {
        title: 'Lower back and hips',
        body: 'Unhurried attention to the areas that commonly carry tension during pregnancy.',
      },
      {
        title: 'Comfort first',
        body: 'Pressure kept gentle throughout, and adjusted the moment you ask.',
      },
    ],
    suitableFor: [
      'Expectant mothers looking for time to rest',
      'Tension through the lower back, hips or shoulders',
      'Anyone who would like supported, side-lying positioning',
    ],
    metaDescription:
      'Pregnancy massage at Life X Therapy — gentle prenatal bodywork built around your comfort, in 60 or 90 minute sessions from $85. Book online through Vagaro.',
    featuredOnHome: false,
  },
  {
    slug: 'sports-massage',
    name: 'Sports Massage',
    shortName: 'Sports',
    description:
      'Massage focused on active individuals and athletes, targeting areas of muscle tension while supporting flexibility, recovery, and physical performance.',
    intro:
      'Bodywork built around training — focused on the areas that take the load in your sport or routine.',
    sessions: [
      { minutes: 60, price: 95 },
      { minutes: 90, price: 125 },
    ],
    image: '/images/sports.jpg',
    imageAlt: 'Sports massage focused on an athlete’s leg muscles',
    editorialImage: '/images/deep-tissue.jpg',
    editorialImageAlt: 'Therapist working along an athlete’s leg during a sports massage',
    about: [
      'Sports massage is shaped around how you train. The session concentrates on the muscle groups that carry the most load in your sport or weekly routine.',
      'Pressure and technique vary depending on where you are in your training week — a session before an event is approached differently to one after a heavy block.',
    ],
    whatToExpect: [
      'A conversation about your sport, your current training load, and where you are noticing tightness.',
      'Focused work through the major muscle groups involved, combined with broader strokes between them.',
      'Firmer pressure where it is useful, always kept within a range you are comfortable with.',
    ],
    focusAreas: [
      {
        title: 'Working muscle groups',
        body: 'Time concentrated on the legs, hips, shoulders or back, depending on your sport.',
      },
      {
        title: 'Training load',
        body: 'The session is adapted to where you are in your training or competition week.',
      },
      {
        title: 'Range of movement',
        body: 'Attention to areas that feel tight or restricted through their normal range.',
      },
    ],
    suitableFor: [
      'Regular training, running or cycling',
      'Tightness in the legs, hips or shoulders',
      'Recovery days within a training block',
      'Anyone who prefers firmer, focused pressure',
    ],
    metaDescription:
      'Sports massage at Life X Therapy — focused bodywork for active people and athletes, in 60 or 90 minute sessions from $95. Book online through Vagaro.',
    featuredOnHome: false,
  },
  {
    slug: 'hot-stone-massage',
    name: 'Hot Stone Massage',
    shortName: 'Hot Stone',
    description:
      'A warm, deeply relaxing massage experience incorporating heated stones to help ease tension and create a calming bodywork experience.',
    intro:
      'Warmth and massage together — heated basalt stones worked alongside the hands for a slower, quieter session.',
    sessions: [
      { minutes: 60, price: 110 },
      { minutes: 90, price: 140 },
    ],
    image: '/images/hot-stone.jpg',
    imageAlt: 'Heated basalt stones placed along a client’s back',
    editorialImage: '/images/booking-cta.jpg',
    editorialImageAlt: 'Close view of hands during a calm massage session',
    about: [
      'Hot stone massage combines smooth, heated basalt stones with conventional massage technique. The stones are rested along the body and also used in the hand as the work moves.',
      'The warmth allows the session to stay slow and steady, and many people find it the quietest of the treatments offered here.',
    ],
    whatToExpect: [
      'Stone temperature checked with you before the session begins, and again if you would like it warmer or cooler.',
      'Stones rested along the back and limbs while the surrounding areas are worked by hand.',
      'A slower overall pace than a standard massage, with fewer changes of position.',
    ],
    focusAreas: [
      {
        title: 'Sustained warmth',
        body: 'Heated stones held along the back and limbs throughout the session.',
      },
      {
        title: 'A slower pace',
        body: 'Longer, quieter passages of work with fewer transitions.',
      },
      {
        title: 'Broad relaxation',
        body: 'Attention across the body rather than concentrated on one region.',
      },
    ],
    suitableFor: [
      'Anyone who runs cold or enjoys warmth',
      'Looking for the quietest, slowest session on offer',
      'A treat or occasion booking',
      'Preferring moderate rather than deep pressure',
    ],
    metaDescription:
      'Hot stone massage at Life X Therapy — heated basalt stones and skilled massage in 60 or 90 minute sessions from $110. Book online through Vagaro.',
    featuredOnHome: false,
  },
  {
    slug: 'deep-tissue-massage',
    name: 'Deep Tissue Massage',
    shortName: 'Deep Tissue',
    description:
      'Focused bodywork using deeper pressure to target persistent muscle tension and deeper layers of muscle and connective tissue.',
    intro:
      'Slower, firmer work into the deeper layers of muscle and connective tissue, for tension that has not eased with lighter massage.',
    sessions: [
      { minutes: 60, price: 95 },
      { minutes: 90, price: 125 },
    ],
    image: '/images/deep-pressure.jpg',
    imageAlt: 'Deep tissue massage using sustained pressure along the shoulders',
    editorialImage: '/images/hero-massage.jpg',
    editorialImageAlt: 'Therapist working slowly across a client’s back',
    about: [
      'Deep tissue massage works more slowly and with more sustained pressure than a classic massage, reaching the layers beneath the surface muscle.',
      'Because the pace is slower, sessions usually cover less of the body and spend longer in each area. It is a firm treatment, and communication about pressure matters more here than anywhere else.',
    ],
    whatToExpect: [
      'A conversation about the areas you want worked on and how firm you would like the pressure to be.',
      'Slow, deliberate work through a smaller number of areas, rather than a full-body sequence.',
      'Frequent check-ins — pressure should stay firm but manageable, and it is adjusted as soon as you say so.',
    ],
    focusAreas: [
      {
        title: 'Deeper layers',
        body: 'Sustained pressure beneath the surface muscle rather than broad surface strokes.',
      },
      {
        title: 'Persistent tension',
        body: 'Time spent on areas that have not changed with lighter work.',
      },
      {
        title: 'Postural patterns',
        body: 'Attention to the shoulders, neck, hips and lower back where holding patterns build.',
      },
    ],
    suitableFor: [
      'Tension that lighter massage has not shifted',
      'Preferring firm, sustained pressure',
      'A small number of specific problem areas',
      'Previous experience with deeper bodywork',
    ],
    metaDescription:
      'Deep tissue massage at Life X Therapy — slow, firm bodywork for persistent tension, in 60 or 90 minute sessions from $95. Book online through Vagaro.',
    featuredOnHome: true,
  },
]

export const serviceSlugs = services.map((service) => service.slug)

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug)
}

export const homeServices = services.filter((service) => service.featuredOnHome)

/** Next services in catalog order, wrapping around. Never links to itself. */
export function getRelatedServices(slug: string, count = 3): Service[] {
  const index = services.findIndex((service) => service.slug === slug)
  if (index === -1) return services.slice(0, count)
  return Array.from({ length: Math.min(count, services.length - 1) }, (_, offset) => {
    return services[(index + offset + 1) % services.length]
  })
}

export function startingPrice(service: Service): number {
  return Math.min(...service.sessions.map((session) => session.price))
}

export function formatPrice(price: number): string {
  return `$${price}`
}
