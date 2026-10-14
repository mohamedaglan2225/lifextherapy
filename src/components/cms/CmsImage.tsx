import Image, { type ImageProps } from 'next/image'
import { isPreviewMedia, mediaUrl } from '@/lib/cms/media'

/**
 * next/image for CMS image values. Uploaded files resolve to the public media
 * bucket; in an admin preview, unpublished files stream from the private
 * bucket and skip optimisation.
 */
export function CmsImage({ src, alt, ...props }: Omit<ImageProps, 'src'> & { src: string }) {
  const url = mediaUrl(src)
  if (!url) return null
  return <Image src={url} alt={alt} unoptimized={isPreviewMedia(url)} {...props} />
}
