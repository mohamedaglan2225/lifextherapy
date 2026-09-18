'use client'

import type { SessionLength } from '@/data/services'
import { formatPrice } from '@/data/services'
import { cn } from '@/lib/cn'

type SessionOptionProps = {
  name: string
  session: SessionLength
  checked: boolean
  onSelect: () => void
}

export function SessionOption({ name, session, checked, onSelect }: SessionOptionProps) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={session.minutes}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        className={cn(
          'flex min-w-[72px] flex-col items-center rounded-sm border px-4 py-2.5 text-xs',
          'transition-premium duration-[var(--lx-fast)]',
          'motion-safe:active:scale-[0.97]',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bronze',
          checked
            ? 'border-bronze bg-bronze text-ivory shadow-[0_8px_18px_-12px_rgba(154,121,85,0.95)] motion-safe:-translate-y-px'
            : 'border-border text-bronze-dark hover:border-bronze hover:text-bronze',
        )}
      >
        <span className="text-sm font-semibold">{session.minutes} min</span>
        <span className={cn('mt-0.5 font-light', checked ? 'text-ivory-dark' : 'text-bronze')}>
          {formatPrice(session.price)}
        </span>
      </span>
    </label>
  )
}
