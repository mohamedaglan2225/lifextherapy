import { cookies, draftMode } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { PREVIEW_FOCUS_COOKIE } from '@/lib/cms/published'

/** Leaves preview and returns to the same page, now showing published content. */
export async function POST(request: NextRequest) {
  ;(await draftMode()).disable()
  ;(await cookies()).delete(PREVIEW_FOCUS_COOKIE)

  let path = '/'
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const url = new URL(referer)
      if (url.host === request.nextUrl.host && !url.pathname.startsWith('/api/')) path = url.pathname
    } catch {}
  }
  return NextResponse.redirect(new URL(path, request.url), 303)
}
