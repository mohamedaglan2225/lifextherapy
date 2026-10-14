'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { cleanupMedia, deleteMedia, replaceMediaInDrafts, updateMediaAlt } from '@/app/admin/actions/media'
import type { MediaItem } from '@/lib/cms/repo'
import { PAGE_DEFS, type PageKey } from '@/lib/cms/sections'
import { cn } from '@/lib/cn'
import { Badge, buttons, inputClass, Notice, Panel } from './ui'
import { ACCEPTED_IMAGE_TYPES, uploadImage } from './upload'

function usageLabel(usage: MediaItem['usage'][number]) {
  switch (usage.kind) {
    case 'page':
      return PAGE_DEFS[usage.key as PageKey]?.label ?? usage.key
    case 'settings':
      return 'Settings'
    case 'faqs':
      return 'FAQs'
    case 'service':
      return 'A service'
    case 'promotion':
      return 'A promotion'
  }
}

function usageHref(usage: MediaItem['usage'][number]) {
  switch (usage.kind) {
    case 'page':
      return `/admin/pages/${usage.key}`
    case 'settings':
      return '/admin/settings'
    case 'faqs':
      return '/admin/faqs'
    case 'service':
      return `/admin/services/${usage.key}`
    case 'promotion':
      return `/admin/promotions/${usage.key}`
  }
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

function MediaCard({ item, onMessage }: { item: MediaItem; onMessage: (tone: 'success' | 'error', text: string) => void }) {
  const router = useRouter()
  const [alt, setAlt] = useState(item.alt)
  const [pending, start] = useTransition()
  const used = item.usage.length > 0
  const places = [...new Map(item.usage.map((usage) => [`${usage.kind}:${usage.key}`, usage])).values()]

  return (
    <li className="flex flex-col overflow-hidden rounded-sm border border-border bg-offwhite">
      {/* eslint-disable-next-line @next/next/no-img-element -- private signed previews */}
      <img src={item.previewUrl} alt="" className="aspect-4/3 w-full bg-ivory-dark object-cover" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-charcoal" title={item.originalName}>
            {item.originalName || item.path}
          </span>
          <Badge tone={item.isPublic ? 'live' : 'draft'}>{item.isPublic ? 'Public' : 'Private'}</Badge>
        </div>
        <p className="text-xs text-bronze-dark">
          {item.width && item.height ? `${item.width} × ${item.height} · ` : ''}
          {formatSize(item.sizeBytes)}
        </p>
        <div className="flex flex-col gap-1">
          <label htmlFor={`alt-${item.id}`} className="text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">
            Default description
          </label>
          <div className="flex gap-2">
            <input id={`alt-${item.id}`} value={alt} maxLength={200} onChange={(event) => setAlt(event.target.value)} className={inputClass} />
            <button
              type="button"
              className={buttons.quiet}
              disabled={pending || alt === item.alt}
              onClick={() =>
                start(async () => {
                  const result = await updateMediaAlt(item.id, alt)
                  onMessage(result.ok ? 'success' : 'error', result.message)
                  if (result.ok) router.refresh()
                })
              }
            >
              Save
            </button>
          </div>
          <span className="text-[11px] text-bronze-dark">Suggested when you choose this image. Each use keeps its own description.</span>
        </div>
        <div className="text-xs text-bronze-dark">
          {used ? (
            <>
              Used in:{' '}
              {places.map((usage, index) => (
                <span key={`${usage.kind}:${usage.key}`}>
                  {index > 0 && ', '}
                  <a href={usageHref(usage)} className="underline underline-offset-2">
                    {usageLabel(usage)}
                  </a>
                </span>
              ))}
            </>
          ) : (
            'Not used anywhere.'
          )}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-3">
          <label className={cn(buttons.quiet, 'cursor-pointer', (!used || pending) && 'pointer-events-none opacity-40')} title={used ? undefined : 'Only images in use can be replaced'}>
            Replace in drafts
            <input
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              className="sr-only"
              disabled={!used || pending}
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (!file) return
                start(async () => {
                  const uploaded = await uploadImage(file, item.alt)
                  if (!uploaded.ok) return onMessage('error', uploaded.message)
                  const result = await replaceMediaInDrafts(item.path, uploaded.item.path)
                  onMessage(result.ok ? 'success' : 'error', result.message)
                  router.refresh()
                })
              }}
            />
          </label>
          <button
            type="button"
            className={buttons.danger}
            disabled={used || pending}
            title={used ? 'Remove it from the pages that use it first' : undefined}
            onClick={() => {
              if (!window.confirm(`Delete "${item.originalName || item.path}" permanently?`)) return
              start(async () => {
                const result = await deleteMedia(item.id)
                onMessage(result.ok ? 'success' : 'error', result.message)
                router.refresh()
              })
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}

export function MediaLibrary({ initialItems }: { initialItems: MediaItem[] }) {
  const router = useRouter()
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cleaning, startCleaning] = useTransition()
  const [query, setQuery] = useState('')

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setMessage({ tone: 'info', text: 'Uploading…' })
    const problems: string[] = []
    let count = 0
    for (const file of Array.from(files)) {
      const result = await uploadImage(file)
      if (result.ok) count += 1
      else problems.push(result.message)
    }
    setUploading(false)
    setMessage(problems.length ? { tone: 'error', text: problems.join(' ') } : { tone: 'success', text: `Uploaded ${count} image${count === 1 ? '' : 's'}.` })
    router.refresh()
  }

  const items = initialItems.filter((item) => {
    const needle = query.trim().toLowerCase()
    return !needle || item.originalName.toLowerCase().includes(needle) || item.alt.toLowerCase().includes(needle)
  })
  const unusedPublic = initialItems.filter((item) => item.isPublic && !item.usage.some((usage) => usage.state === 'published')).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className={cn(buttons.primary, 'cursor-pointer', uploading && 'pointer-events-none opacity-50')}>
          {uploading ? 'Uploading…' : 'Upload images'}
          <input type="file" accept={ACCEPTED_IMAGE_TYPES} multiple className="sr-only" onChange={(event) => { onFiles(event.target.files); event.target.value = '' }} />
        </label>
        <input type="search" placeholder="Search by name or description" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search images" className={cn(inputClass, 'sm:max-w-xs')} />
      </div>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      {items.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border p-10 text-center text-sm text-bronze-dark">
          {query ? 'No images match your search.' : 'No uploaded images yet. The website’s original photos are available in every image picker.'}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onMessage={(tone, text) => setMessage({ tone, text })} />
          ))}
        </ul>
      )}

      <Panel
        title="Clean up"
        description="Removes public copies of images no published page uses any more (the private original stays, so drafts and history keep working), and stray files from interrupted uploads."
      >
        <p className="text-sm text-charcoal">
          {unusedPublic} public cop{unusedPublic === 1 ? 'y is' : 'ies are'} no longer used by the live website.
        </p>
        <button
          type="button"
          className={cn(buttons.secondary, 'self-start')}
          disabled={cleaning}
          onClick={() =>
            startCleaning(async () => {
              const result = await cleanupMedia()
              setMessage({ tone: result.ok ? 'success' : 'error', text: result.message })
              router.refresh()
            })
          }
        >
          {cleaning ? 'Cleaning up…' : 'Clean up'}
        </button>
      </Panel>
    </div>
  )
}
