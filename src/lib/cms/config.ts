/**
 * Public Supabase connection settings. Both values are safe to expose: the
 * publishable key only grants what Row Level Security allows anonymous
 * visitors, which is reading published content.
 *
 * Returns null until both variables are set, so the site keeps working on its
 * built-in content before the CMS is connected.
 */
export function getSupabaseConfig(): { url: string; publishableKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!url || !publishableKey) return null
  return { url: url.replace(/\/+$/, ''), publishableKey }
}

export const MEDIA_DRAFT_BUCKET = 'cms-drafts'
export const MEDIA_PUBLIC_BUCKET = 'cms-public'
export const MEDIA_MAX_BYTES = 5 * 1024 * 1024
export const MEDIA_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

