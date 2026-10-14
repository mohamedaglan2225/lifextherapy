import { publicMediaUrl } from './config'
import { isUploadedImage } from './schema'

/** Resolves a stored image value to a URL the public site can render. */
export function publishedImageSrc(value: string | null) {
  if (!value) return null
  if (isUploadedImage(value)) return publicMediaUrl(value)
  return value
}
