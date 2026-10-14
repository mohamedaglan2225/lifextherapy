'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createDocument, moveDocument, refreshEverything } from '@/app/admin/actions/documents'
import { buttons, Notice } from './ui'

export function CreateButton({ kind, label }: { kind: 'service' | 'promotion'; label: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        className={buttons.primary}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await createDocument(kind)
            if (result.ok && result.key) router.push(`/admin/${kind === 'service' ? 'services' : 'promotions'}/${result.key}`)
            else setError(result.message)
          })
        }
      >
        {pending ? 'Creating…' : label}
      </button>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  )
}

export function MoveControls({ kind, docKey, first, last, label }: { kind: 'service' | 'promotion'; docKey: string; first: boolean; last: boolean; label: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const move = (direction: 'up' | 'down') =>
    start(async () => {
      const result = await moveDocument(kind, docKey, direction)
      if (!result.ok) window.alert(result.message)
      router.refresh()
    })
  return (
    <span className="flex gap-1">
      <button type="button" className={buttons.icon} disabled={first || pending} onClick={() => move('up')} aria-label={`Move ${label} up`}>
        ↑
      </button>
      <button type="button" className={buttons.icon} disabled={last || pending} onClick={() => move('down')} aria-label={`Move ${label} down`}>
        ↓
      </button>
    </span>
  )
}

export function RefreshAllButton() {
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={buttons.quiet}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await refreshEverything()
            setMessage({ ok: result.ok, text: result.message })
          })
        }
      >
        {pending ? 'Refreshing…' : 'Refresh entire live site'}
      </button>
      {message && <Notice tone={message.ok ? 'success' : 'error'}>{message.text}</Notice>}
    </div>
  )
}
