import { cn } from '@/lib/cn'

const styles = {
  published: 'border-emerald-800/30 bg-emerald-50 text-emerald-900',
  changed: 'border-amber-700/30 bg-amber-50 text-amber-900',
  draft: 'border-border bg-ivory-dark text-bronze-dark',
} as const

const labels = {
  published: 'Live',
  changed: 'Live · unpublished changes',
  draft: 'Hidden',
} as const

export function StatusBadge({ status }: { status: keyof typeof styles }) {
  return (
    <span className={cn('inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold', styles[status])}>
      {labels[status]}
    </span>
  )
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/New_York',
})

export function formatTimestamp(value: string | null) {
  return value ? `${dateFormat.format(new Date(value))} ET` : 'never'
}
