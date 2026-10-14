'use client'

import { useId, useState, type ChangeEvent } from 'react'
import { getSupabaseConfig, MEDIA_DRAFT_BUCKET, MEDIA_MAX_BYTES, MEDIA_TYPES } from '@/lib/cms/config'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { secondaryButton } from './FormFooter'

type ImageFieldProps = {
  name: string
  label: string
  initialPath: string
  initialPreviewUrl: string | null
  optional?: boolean
  error?: string
  onUploadingChange?: (uploading: boolean) => void
}

/**
 * Uploads straight from the browser to the private drafts bucket (allowed for
 * admins only by Storage RLS). The image becomes public only when the content
 * that uses it is published.
 */
export function ImageField({
  name,
  label,
  initialPath,
  initialPreviewUrl,
  optional = false,
  error,
  onUploadingChange,
}: ImageFieldProps) {
  const inputId = useId()
  const [path, setPath] = useState(initialPath)
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl)
  const [status, setStatus] = useState<{ tone: 'info' | 'error'; text: string } | null>(null)

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    const extension = MEDIA_TYPES[file.type]
    if (!extension) {
      setStatus({ tone: 'error', text: 'Use a JPG, PNG, WebP or AVIF image.' })
      input.value = ''
      return
    }
    if (file.size > MEDIA_MAX_BYTES) {
      setStatus({ tone: 'error', text: 'Images must be 5 MB or smaller.' })
      input.value = ''
      return
    }
    const config = getSupabaseConfig()
    if (!config) {
      setStatus({ tone: 'error', text: 'Image uploads are not configured.' })
      return
    }

    setStatus({ tone: 'info', text: 'Uploading…' })
    onUploadingChange?.(true)
    const objectPath = `${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await createSupabaseBrowserClient(config.url, config.publishableKey)
      .storage.from(MEDIA_DRAFT_BUCKET)
      .upload(objectPath, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
    onUploadingChange?.(false)
    input.value = ''

    if (uploadError) {
      setStatus({ tone: 'error', text: 'The upload failed. Check your connection and try again.' })
      return
    }
    setPath(objectPath)
    setPreviewUrl(URL.createObjectURL(file))
    setStatus({ tone: 'info', text: 'Uploaded. Save or publish to use this image.' })
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal">{label}</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-ivory-dark sm:w-56">
          {previewUrl ? (
            // Dashboard-only preview of a private or just-selected file; next/image cannot optimise either.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-bronze-dark">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className={`${secondaryButton} cursor-pointer self-start`}>
            {path ? 'Replace image' : 'Upload image'}
          </label>
          <input
            id={inputId}
            type="file"
            accept={Object.keys(MEDIA_TYPES).join(',')}
            onChange={onFileChange}
            className="sr-only"
          />
          <p className="text-xs font-light text-bronze-dark">JPG, PNG, WebP or AVIF, up to 5 MB.</p>
          {optional && path && (
            <button
              type="button"
              onClick={() => {
                setPath('')
                setPreviewUrl(null)
                setStatus({ tone: 'info', text: 'Image removed. Save or publish to apply.' })
              }}
              className="self-start text-xs font-medium text-red-800 underline underline-offset-4"
            >
              Remove image
            </button>
          )}
          <p
            role={status?.tone === 'error' ? 'alert' : 'status'}
            className={status?.tone === 'error' ? 'text-xs font-medium text-red-800' : 'text-xs text-bronze-dark'}
          >
            {status?.text}
          </p>
          {error && <p className="text-xs font-medium text-red-800">{error}</p>}
        </div>
      </div>
      <input type="hidden" name={name} value={path} />
    </div>
  )
}
