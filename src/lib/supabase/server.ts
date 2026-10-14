import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseConfig } from '@/lib/cms/config'

/**
 * Supabase client for Server Components and Server Actions, acting as the
 * signed-in user. Every query it makes is subject to Row Level Security.
 * Create one per request; never share it between requests.
 */
export async function createSupabaseServerClient() {
  const config = getSupabaseConfig()
  if (!config) return null
  const cookieStore = await cookies()

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components cannot set cookies; src/proxy.ts refreshes the session instead.
        }
      },
    },
  })
}
