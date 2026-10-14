'use client'

import { useEffect, useRef, useState } from 'react'
import { listMediaForPicker } from '@/app/admin/actions/media'
import type { ImageValue } from '@/lib/cms/fields'
import type { MediaItem } from '@/lib/cms/repo'
import { cn } from '@/lib/cn'
import { buttons, inputClass } from './ui'
import { ACCEPTED_IMAGE_TYPES, uploadImage } from './upload'

/** Images bundled with the website (public/images). */
export const WEBSITE_IMAGES = [
  'hero-massage.jpg',
  'philosophy.jpg',
  'booking-cta.jpg',
  'swedish.jpg',
  'deep-pressure.jpg',
  'deep-tissue.jpg',
  'hot-stone.jpg',
  'pregnancy.jpg',
  'sports.jpg',
  'logo-mark.png',
].map((name) => `/images/${name}`)

type Selection = Pick<ImageValue, 'src' | 'alt' | 'width' | 'height'> & { previewUrl: string }

export function MediaPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (selection: Selection) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [items, setItems] = useState<MediaItem[] | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<{ tone: 'info' | 'error'; text: string } | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) {
      element.showModal()
      listMediaForPicker().then((result) => {
        if (result.ok) setItems(result.items)
        else setStatus({ tone: 'error', text: 'Your session has ended. Sign in again in another tab.' })
      })
    }
    if (!open && element.open) element.close()
  }, [open])

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setStatus({ tone: 'info', text: 'Uploading…' })
    const uploaded: MediaItem[] = []
    const problems: string[] = []
    for (const file of Array.from(files)) {
      const result = await uploadImage(file)
      if (result.ok) uploaded.push(result.item)
      else problems.push(result.message)
    }
    setItems((current) => [...uploaded, ...(current ?? [])])
    setUploading(false)
    setStatus(problems.length ? { tone: 'error', text: problems.join(' ') } : { tone: 'info', text: `Uploaded ${uploaded.length} image${uploaded.length === 1 ? '' : 's'}. Choose one below.` })
  }

  const filtered = (items ?? []).filter((item) => {
    const needle = query.trim().toLowerCase()
    return !needle || item.originalName.toLowerCase().includes(needle) || item.alt.toLowerCase().includes(needle)
  })

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="media-picker-title"
      className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-sm border border-border bg-ivory p-0 text-charcoal backdrop:bg-charcoal/60"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 id="media-picker-title" className="font-serif text-2xl">
            Choose an image
          </h2>
          <button type="button" className={buttons.quiet} onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <label className={cn(buttons.primary, 'cursor-pointer', uploading && 'pointer-events-none opacity-50')}>
            Upload new
            <input type="file" accept={ACCEPTED_IMAGE_TYPES} multiple className="sr-only" onChange={(event) => { onFiles(event.target.files); event.target.value = '' }} />
          </label>
          <input type="search" placeholder="Search by name or description" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search images" className={cn(inputClass, 'sm:max-w-xs')} />
          <p role={status?.tone === 'error' ? 'alert' : 'status'} className={cn('text-xs', status?.tone === 'error' ? 'text-red-800' : 'text-bronze-dark')}>
            {status?.text}
          </p>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-bronze">Uploaded images</h3>
          {items === null ? (
            <p className="text-sm text-bronze-dark">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-bronze-dark">No uploaded images{query ? ' match your search' : ' yet'}.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect({ src: item.path, alt: item.alt, width: item.width ?? undefined, height: item.height ?? undefined, previewUrl: item.previewUrl })}
                    className="group flex w-full flex-col overflow-hidden rounded-sm border border-border bg-offwhite text-left hover:border-bronze"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- private signed previews */}
                    <img src={item.previewUrl} alt="" className="aspect-4/3 w-full object-cover" />
                    <span className="truncate px-2 py-1.5 text-xs text-charcoal">{item.originalName || item.path}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-bronze">Website images</h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {WEBSITE_IMAGES.map((src) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => onSelect({ src, alt: '', previewUrl: src, ...(src.endsWith('logo-mark.png') ? { width: 499, height: 505 } : {}) })}
                  className="flex w-full flex-col overflow-hidden rounded-sm border border-border bg-offwhite text-left hover:border-bronze"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- dashboard thumbnail */}
                  <img src={src} alt="" className="aspect-4/3 w-full object-cover" />
                  <span className="truncate px-2 py-1.5 text-xs text-charcoal">{src.replace('/images/', '')}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  )
}
