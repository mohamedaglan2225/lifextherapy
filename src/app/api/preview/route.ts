import { cookies, draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { getAdminSession } from '@/lib/cms/admin'
import { DOC_KINDS, isValidDocKey, type DocKind, type PromotionDoc, type ServiceDoc } from '@/lib/cms/documents'
import { PREVIEW_FOCUS_COOKIE } from '@/lib/cms/published'
import { listDocStates, loadDocState } from '@/lib/cms/repo'
import { PAGE_DEFS, type PageKey } from '@/lib/cms/sections'

/**
 * Turns on preview for the signed-in admin and opens the page showing a
 * document. Drafts are then read with the admin's own session, so the preview
 * cookie alone reveals nothing to anyone else.
 */
export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return new NextResponse('Sign in to the dashboard to preview drafts.', { status: 401 })

  const kind = request.nextUrl.searchParams.get('kind') as DocKind
  const key = request.nextUrl.searchParams.get('key') ?? ''
  if (!(DOC_KINDS as readonly string[]).includes(kind) || !isValidDocKey(kind, key)) {
    return new NextResponse('Unknown content.', { status: 400 })
  }

  let path = '/'
  if (kind === 'page') {
    if (key === 'service') {
      const services = await listDocStates(session.supabase, 'service')
      const first = services.map((doc) => doc.draft?.data as ServiceDoc | undefined).find((service) => service?.status === 'active')
      path = first ? `/services/${first.slug}` : '/services'
    } else {
      path = PAGE_DEFS[key as PageKey].path
    }
  } else if (kind === 'service') {
    const service = (await loadDocState(session.supabase, 'service', key))?.draft?.data as ServiceDoc | undefined
    path = service ? `/services/${service.slug}` : '/services'
  } else if (kind === 'promotion') {
    const promotion = (await loadDocState(session.supabase, 'promotion', key))?.draft?.data as PromotionDoc | undefined
    path = PAGE_DEFS[promotion?.placements[0] ?? 'home'].path
  } else if (kind === 'faqs') {
    path = '/faq'
  }

  ;(await draftMode()).enable()
  ;(await cookies()).set(PREVIEW_FOCUS_COOKIE, `${kind}:${key}`, { httpOnly: true, sameSite: 'lax', path: '/', secure: request.nextUrl.protocol === 'https:' })
  redirect(path)
}
