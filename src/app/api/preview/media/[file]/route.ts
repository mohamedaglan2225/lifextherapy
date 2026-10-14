import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/cms/admin'
import { MEDIA_DRAFT_BUCKET } from '@/lib/cms/config'
import { isUploadedImage } from '@/lib/cms/fields'

/** Streams a private draft image to an admin who is previewing. Never cached. */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  if (!isUploadedImage(file)) return new NextResponse(null, { status: 404 })
  if (!(await draftMode()).isEnabled) return new NextResponse(null, { status: 404 })
  const session = await getAdminSession()
  if (!session) return new NextResponse(null, { status: 404 })

  const { data, error } = await session.supabase.storage.from(MEDIA_DRAFT_BUCKET).download(file)
  if (error || !data) return new NextResponse(null, { status: 404 })
  return new NextResponse(data, {
    headers: { 'Content-Type': data.type || 'application/octet-stream', 'Cache-Control': 'private, no-store' },
  })
}
