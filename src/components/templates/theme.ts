/**
 * Background presets for owner-added sections. Each pairs a background with
 * text colours from the site palette that keep body text at WCAG AA contrast.
 */
export const THEMES = {
  ivory: { section: 'bg-ivory', heading: 'text-charcoal', body: 'text-bronze-dark', card: 'bg-offwhite border-border', button: 'primary' },
  'ivory-dark': { section: 'bg-ivory-dark', heading: 'text-charcoal', body: 'text-bronze-dark', card: 'bg-offwhite border-border', button: 'primary' },
  offwhite: { section: 'bg-offwhite', heading: 'text-charcoal', body: 'text-bronze-dark', card: 'bg-ivory border-border', button: 'primary' },
  charcoal: { section: 'bg-charcoal', heading: 'text-offwhite', body: 'text-border', card: 'bg-charcoal-soft border-charcoal-soft', button: 'primary' },
} as const

export type ThemeName = keyof typeof THEMES

export function theme(name: string) {
  return THEMES[(name in THEMES ? name : 'ivory') as ThemeName]
}

export const GRID_COLUMNS: Record<string, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
}
