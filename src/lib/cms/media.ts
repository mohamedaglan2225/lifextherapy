import { getSupabaseConfig, MEDIA_PUBLIC_BUCKET } from './config'
import { isUploadedImage } from './fields'

export const PREVIEW_MEDIA_PREFIX = '/api/preview/media/'

/** Public URL for a stored image value (bundled `/images/...` or an uploaded file). */
export function mediaUrl(src: string) {
  if (!src) return ''
  if (isUploadedImage(src)) {
    const config = getSupabaseConfig()
    return config ? `${config.url}/storage/v1/object/public/${MEDIA_PUBLIC_BUCKET}/${src}` : ''
  }
  return src
}

/** Draft images are not public yet, so previews stream them through an admin-only route. */
export function isPreviewMedia(src: string) {
  return src.startsWith(PREVIEW_MEDIA_PREFIX)
}
