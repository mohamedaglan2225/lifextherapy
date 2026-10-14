import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseConfig } from '@/lib/cms/config'

/**
 * Refreshes the Supabase session cookie on dashboard requests. This only keeps
 * the session alive and sends signed-out visitors to the login page; it is not
 * the security boundary. Authorization happens again in the dashboard layout,
 * in every Server Action, and in the database.
 */
export async function updateSession(request: NextRequest) {
  const config = getSupabaseConfig()
  if (!config) return NextResponse.next({ request })

  let response = NextResponse.next({ request })

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  // Nothing may run between creating the client and getClaims(), or sessions
  // can be dropped at random (Supabase guidance).
  const { data } = await supabase.auth.getClaims()

  // Only page loads are redirected. Server Actions (POST) run their own admin
  // check and answer with a "session ended" message, so a form keeps its input.
  const isPageLoad = request.method === 'GET' || request.method === 'HEAD'
  if (!data?.claims && isPageLoad && request.nextUrl.pathname !== '/admin/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = ''
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  return response
}
