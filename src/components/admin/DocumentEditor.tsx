'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition, type ReactNode } from 'react'
import {
  publishDocument,
  refreshDocument,
  restoreRevision,
  saveDocument,
} from '@/app/admin/actions/documents'
import type { ActionResult } from '@/app/admin/actions/types'
import { schemaFor, type DocKind } from '@/lib/cms/documents'
import type { Revision } from '@/lib/cms/repo'
import { cn } from '@/lib/cn'
import { useDirtyGuard } from './DirtyGuard'
import { Badge, buttons, formatDateTime, Notice } from './ui'

export type DocumentProps = {
  kind: DocKind
  docKey: string
  initialData: Record<string, unknown>
  initialVersion: number
  publishedData: Record<string, unknown> | null
  publishedAt: string | null
  updatedAt: string | null
  updatedByEmail: string | null
  revisions: Revision[]
}

function issuesToErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const path = issue.path.map(String).join('.') || 'form'
    errors[path] ??= issue.message
  }
  return errors
}

/** State and actions shared by every editor: validation, saving, publishing, conflicts. */
export function useDocument(props: DocumentProps) {
  const router = useRouter()
  const { setDirty } = useDirtyGuard()
  const [data, setData] = useState(props.initialData)
  const [version, setVersion] = useState(props.initialVersion)
  const [saved, setSaved] = useState(() => JSON.stringify(props.initialData))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ActionResult | null>(null)
  const [pending, startTransition] = useTransition()

  const dirty = JSON.stringify(data) !== saved
  const unpublished = !props.publishedData || saved !== JSON.stringify(props.publishedData)

  useEffect(() => {
    setDirty(dirty)
    return () => setDirty(false)
  }, [dirty, setDirty])

  function validate() {
    const parsed = schemaFor(props.kind, props.docKey).safeParse(data)
    if (parsed.success) return true
    setErrors(issuesToErrors(parsed.error.issues))
    setResult({ ok: false, message: 'Please fix the highlighted fields.' })
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"], .border-red-700')?.focus())
    return false
  }

  function apply(next: ActionResult) {
    setResult(next)
    setErrors(next.fieldErrors ?? {})
    if (next.ok && typeof next.version === 'number') {
      const savedData = next.data ?? data
      setVersion(next.version)
      setData(savedData)
      setSaved(JSON.stringify(savedData))
    }
    if (next.ok) router.refresh()
  }

  const save = (publish: boolean) => {
    if (!validate()) return
    startTransition(async () => {
      apply(await saveDocument({ kind: props.kind, key: props.docKey, data, expectedVersion: version, publish }))
    })
  }

  const publishSaved = () =>
    startTransition(async () => {
      apply(await publishDocument(props.kind, props.docKey, version))
    })

  const retryRefresh = () =>
    startTransition(async () => {
      setResult(await refreshDocument(props.kind, props.docKey))
    })

  const discard = () => {
    if (!window.confirm('Discard your unsaved changes?')) return
    setData(JSON.parse(saved))
    setErrors({})
    setResult(null)
  }

  const reloadLatest = () => {
    if (dirty && !window.confirm('Load the latest saved version? Your unsaved edits on this screen will be lost.')) return
    setDirty(false)
    window.location.reload()
  }

  const restore = (revision: Revision) => {
    const question = dirty
      ? 'Restore this version as your draft? Your unsaved edits on this screen will be lost.'
      : 'Restore this version as your draft? You can review it before publishing.'
    if (!window.confirm(question)) return
    startTransition(async () => {
      const next = await restoreRevision(props.kind, props.docKey, revision.id, version)
      if (next.ok) {
        setDirty(false)
        window.location.reload()
      } else setResult(next)
    })
  }

  return { data, setData, version, errors, result, pending, dirty, unpublished, save, publishSaved, retryRefresh, discard, reloadLatest, restore }
}

export type DocumentController = ReturnType<typeof useDocument>

/** Publication status shown above the form. */
export function DocumentStatus({ doc, props }: { doc: DocumentController; props: DocumentProps }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-bronze-dark">
      {!props.publishedData ? (
        <Badge tone="draft">Not published</Badge>
      ) : doc.unpublished || doc.dirty ? (
        <Badge tone="changed">Unpublished changes</Badge>
      ) : (
        <Badge tone="live">Published</Badge>
      )}
      <span>Last published {formatDateTime(props.publishedAt)}</span>
      {props.updatedAt && (
        <span>
          Draft saved {formatDateTime(props.updatedAt)}
          {props.updatedByEmail ? ` by ${props.updatedByEmail}` : ''}
        </span>
      )}
    </div>
  )
}

/** Message and the save / publish / preview buttons, pinned to the bottom of the screen. */
export function DocumentActions({
  doc,
  props,
  previewable = true,
  extra,
}: {
  doc: DocumentController
  props: DocumentProps
  previewable?: boolean
  extra?: ReactNode
}) {
  const { result, pending, dirty, unpublished } = doc
  return (
    <div className="sticky bottom-3 z-20 mt-8 flex flex-col gap-3 rounded-sm border border-border bg-offwhite/95 p-4 shadow-[0_12px_32px_-20px_rgba(29,27,25,0.5)] backdrop-blur">
      {result && (
        <Notice tone={!result.ok ? 'error' : result.refreshFailed ? 'warning' : 'success'}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{result.message}</span>
            {result.refreshFailed && (
              <button type="button" className={buttons.secondary} onClick={doc.retryRefresh} disabled={pending}>
                Refresh live site
              </button>
            )}
            {result.conflict && (
              <button type="button" className={buttons.secondary} onClick={doc.reloadLatest}>
                Load latest version
              </button>
            )}
          </div>
        </Notice>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {extra}
          {dirty && (
            <button type="button" className={buttons.link} onClick={doc.discard} disabled={pending}>
              Discard changes
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {previewable && (
            <a
              href={`/api/preview?kind=${props.kind}&key=${props.docKey}`}
              target="_blank"
              rel="noreferrer"
              aria-disabled={dirty}
              onClick={(event) => {
                if (dirty) {
                  event.preventDefault()
                  window.alert('Save your draft first, then preview it.')
                }
              }}
              className={cn(buttons.quiet, dirty && 'opacity-50')}
            >
              Preview draft ↗
            </a>
          )}
          <button type="button" className={buttons.secondary} onClick={() => doc.save(false)} disabled={pending || !dirty}>
            {pending ? 'Working…' : 'Save draft'}
          </button>
          <button
            type="button"
            className={buttons.primary}
            onClick={() => (dirty ? doc.save(true) : doc.publishSaved())}
            disabled={pending || (!dirty && !unpublished)}
          >
            {dirty ? 'Save & publish' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function HistoryPanel({ doc, revisions }: { doc: DocumentController; revisions: Revision[] }) {
  const [open, setOpen] = useState(false)
  const latestId = useMemo(() => revisions[0]?.id, [revisions])
  return (
    <section className="mt-8 rounded-sm border border-border bg-offwhite">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <span className="font-serif text-xl text-charcoal">Publishing history</span>
        <span className="text-xs text-bronze-dark">{revisions.length ? `${revisions.length} version${revisions.length === 1 ? '' : 's'}` : 'None yet'}</span>
      </button>
      {open && (
        <ol className="border-t border-border">
          {revisions.length === 0 && <li className="px-5 py-4 text-sm text-bronze-dark">This has not been published yet.</li>}
          {revisions.map((revision) => (
            <li key={revision.id} className="flex flex-col gap-2 border-b border-border px-5 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-charcoal">
                {formatDateTime(revision.publishedAt)}
                {revision.publishedByEmail ? <span className="text-bronze-dark"> · {revision.publishedByEmail}</span> : <span className="text-bronze-dark"> · initial content</span>}
                {revision.id === latestId && <span className="ml-2"><Badge tone="draft">Latest</Badge></span>}
              </span>
              <button type="button" className={buttons.quiet} onClick={() => doc.restore(revision)} disabled={doc.pending}>
                Restore as draft
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
