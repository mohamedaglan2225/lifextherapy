'use client'

import { useState } from 'react'
import type { ImageValue } from '@/lib/cms/fields'
import { isUploadedImage } from '@/lib/cms/fields'
import { cn } from '@/lib/cn'
import { MediaPicker } from './MediaPicker'
import { useEditorOptions } from './fields'
import { buttons, inputClass } from './ui'

export function ImageInput({
  id,
  label,
  hint,
  required,
  decorative,
  value,
  onChange,
  error,
  altError,
}: {
  id: string
  label: string
  hint?: string
  required?: boolean
  decorative?: boolean
  value: ImageValue
  onChange: (value: ImageValue) => void
  error?: string
  altError?: string
}) {
  const { previews } = useEditorOptions()
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [pickerOpen, setPickerOpen] = useState(false)
  const preview = value.src ? (isUploadedImage(value.src) ? (picked[value.src] ?? previews[value.src] ?? '') : value.src) : ''

  return (
    <fieldset className={cn('flex flex-col gap-3 rounded-sm border p-4', error ? 'border-red-700' : 'border-border')}>
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">
        {label}
        {required ? '' : ' (optional)'}
      </legend>
      {hint && <p className="-mt-1 text-xs font-light text-bronze-dark">{hint}</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex aspect-4/3 w-full shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-ivory-dark sm:w-48">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- dashboard preview of private or bundled images
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-bronze-dark">{value.src ? 'Preview unavailable' : 'No image'}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" id={id} className={buttons.secondary} onClick={() => setPickerOpen(true)}>
              {value.src ? 'Change image' : 'Choose image'}
            </button>
            {!required && value.src && (
              <button type="button" className={buttons.link} onClick={() => onChange({ src: '', alt: '' })}>
                Remove image
              </button>
            )}
          </div>
          {!decorative && value.src && (
            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-alt`} className="text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">
                Image description
              </label>
              <span className="text-xs font-light text-bronze-dark">Describes the photo for visitors using screen readers and for search engines.</span>
              <input
                id={`${id}-alt`}
                value={value.alt}
                maxLength={200}
                onChange={(event) => onChange({ ...value, alt: event.target.value })}
                aria-invalid={altError ? true : undefined}
                className={inputClass}
              />
              {altError && <p className="text-xs font-medium text-red-800">{altError}</p>}
            </div>
          )}
          {decorative && <p className="text-xs font-light text-bronze-dark">Decorative background: no description needed.</p>}
          {error && <p className="text-xs font-medium text-red-800">{error}</p>}
        </div>
      </div>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(selection) => {
          setPicked((current) => ({ ...current, [selection.src]: selection.previewUrl }))
          onChange({
            src: selection.src,
            alt: decorative ? '' : selection.alt || value.alt,
            ...(selection.width ? { width: selection.width } : {}),
            ...(selection.height ? { height: selection.height } : {}),
          })
          setPickerOpen(false)
        }}
      />
    </fieldset>
  )
}
