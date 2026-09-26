/**
 * Single source of truth for every Vagaro booking link on the site.
 *
 * Resolution order for a Book action:
 *   1. The exact service + duration URL below, when one is set.
 *   2. The Life X Therapy public Vagaro business page.
 *
 * Service URLs are verified Vagaro "Create Link" URLs supplied by the business.
 * Copy them exactly — never edit, decode or guess one.
 */

/** Life X Therapy LLC public booking page on Vagaro (business ID 397358). */
export const vagaroBusinessUrl = 'https://www.vagaro.com/lifextherapy'

/** Keyed by service slug (see `src/data/services.ts`), then session minutes. */
export const vagaroServiceUrls: Record<string, Record<number, string | null>> = {
  'swedish-massage': {
    60: 'https://www.vagaro.com/cl/9RecE2kcCzyBYbFy4PQb26U~7VWDwJcRhCEGkQdeKX8=',
    90: 'https://www.vagaro.com/cl/9~C7dKH9MrvGIjKqCGPTyWPRdoKC6x~UILeU~8l-ErQ=',
    120: 'https://www.vagaro.com/cl/yZB0sdjbfDgKSHFazI466wcLKQON50UT190kAop44lk=',
  },
  'therapeutic-massage': {
    60: 'https://www.vagaro.com/cl/Spc0jIgL3pWWtI85tfAMWLBMsfVbpzsvHHXRIOQUK6Y=',
    90: 'https://www.vagaro.com/cl/0W5V2Q4P2KBms6S3CNi59a~GeeE~A2hUOdTShPUYv7c=',
    120: 'https://www.vagaro.com/cl/Vvr0mayYZhJA3PMHUxJgke7Ezq5~uPgZXlG2JyTQOMQ=',
  },
  'pregnancy-massage': {
    60: 'https://www.vagaro.com/cl/s2K5CuOPUQujM9RY0WbLQBM-S20tdYWS1dTsolycZ88=',
    90: 'https://www.vagaro.com/cl/DiO44A7o4KLO4Rsc~IWDPKIMy9fz3zTof-u7uzdqaL4=',
  },
  /** Vagaro lists this service as "Sport Massage". */
  'sports-massage': {
    60: 'https://www.vagaro.com/cl/MxjW1LyhtCvQTqZPUVw4Q5WaRMJUAOUXDcM2fy-afDo=',
    90: 'https://www.vagaro.com/cl/KOlU176ZPfPGPUEgAAl36XhRspJTx-xwWKjwga5OxCM=',
  },
  'hot-stone-massage': {
    60: 'https://www.vagaro.com/cl/V~~RIRAbnq6pvaW~oRBEePuCbLXpTqYl1P5ALU5KJj8=',
    90: 'https://www.vagaro.com/cl/~YiMVfAMaqjqTdpYPkG1l4Sy-DsFo4nOvQxwOL7scIg=',
  },
  'deep-tissue-massage': {
    60: 'https://www.vagaro.com/cl/-kmRJ6~RAvvfaohFvz7CnbLBniVR-rpHMo-wXVDGwuo=',
    90: 'https://www.vagaro.com/cl/un0VNs64gKcNiFK8KGbhk~o-y4cuUayUUJognfF~BjA=',
  },
}

/**
 * Verified Vagaro links for "Custom Massage. Mobile Service!". The site does not
 * offer this service yet, so nothing links here until it is added to
 * `src/data/services.ts` and moved into `vagaroServiceUrls` under its slug.
 */
export const vagaroUnusedMobileServiceUrls: Record<number, string> = {
  60: 'https://www.vagaro.com/cl/2Plq5~jgQT2Tk67kYDcubWMhAQAwdwpOtuF0bHQhEdk=',
  90: 'https://www.vagaro.com/cl/i6gOIkM2BZiTJqGMZxtUcjn-pDCjDm--bhu1Gljusn8=',
  120: 'https://www.vagaro.com/cl/P1DkWdmj5t77BuGdBla7cXK9wKX5LTUc1s~fAMLQVQc=',
}

export function getVagaroBookingUrl(serviceSlug?: string, minutes?: number): string {
  if (serviceSlug && minutes) {
    const url = vagaroServiceUrls[serviceSlug]?.[minutes]
    if (url) return url
  }
  return vagaroBusinessUrl
}
