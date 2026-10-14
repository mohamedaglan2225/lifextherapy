import { createBrowserClient } from '@supabase/ssr'

/** Browser client used by the dashboard for direct image uploads (still bound by RLS). */
export function createSupabaseBrowserClient(url: string, publishableKey: string) {
  return createBrowserClient(url, publishableKey)
}
