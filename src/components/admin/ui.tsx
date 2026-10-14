import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-premium duration-[var(--lx-fast)] disabled:cursor-not-allowed disabled:opacity-50'

export const buttons = {
  primary: cn(buttonBase, 'bg-charcoal text-ivory hover:bg-bronze'),
  secondary: cn(buttonBase, 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory'),
  quiet: cn(buttonBase, 'border border-border bg-offwhite text-charcoal hover:border-charcoal'),
  danger: cn(buttonBase, 'border border-red-800 text-red-800 hover:bg-red-800 hover:text-ivory'),
  link: 'text-xs font-semibold text-bronze-dark underline underline-offset-4 hover:text-charcoal disabled:opacity-40',
  icon: 'inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-offwhite text-sm text-charcoal hover:border-charcoal disabled:cursor-not-allowed disabled:opacity-35',
}

export const inputClass =
  'w-full rounded-sm border border-border bg-offwhite px-3 py-2.5 text-sm text-charcoal placeholder:text-bronze-dark/60 focus:border-bronze aria-[invalid=true]:border-red-700'

export function PageTitle({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl text-charcoal lg:text-4xl">{title}</h1>
        {description && <div className="mt-2 max-w-2xl text-sm font-light text-bronze-dark">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, description, children, className }: { title?: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-sm border border-border bg-offwhite p-5 lg:p-7', className)}>
      {title && <h2 className="font-serif text-xl text-charcoal">{title}</h2>}
      {description && <div className="mt-1 text-sm font-light text-bronze-dark">{description}</div>}
      <div className={cn('flex flex-col gap-5', title && 'mt-5')}>{children}</div>
    </section>
  )
}

const badgeTones = {
  live: 'border-emerald-800/30 bg-emerald-50 text-emerald-900',
  changed: 'border-amber-700/40 bg-amber-50 text-amber-900',
  draft: 'border-border bg-ivory-dark text-bronze-dark',
  scheduled: 'border-sky-800/30 bg-sky-50 text-sky-900',
  ended: 'border-border bg-ivory-dark text-bronze-dark',
  archived: 'border-border bg-ivory-dark text-bronze-dark',
  danger: 'border-red-800/30 bg-red-50 text-red-900',
} as const

export function Badge({ tone, children }: { tone: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-semibold', badgeTones[tone])}>
      {children}
    </span>
  )
}

export function Notice({ tone, children }: { tone: 'success' | 'error' | 'warning' | 'info'; children: ReactNode }) {
  const tones = {
    success: 'border-emerald-800/30 bg-emerald-50 text-emerald-900',
    error: 'border-red-800/30 bg-red-50 text-red-900',
    warning: 'border-amber-700/40 bg-amber-50 text-amber-900',
    info: 'border-border bg-ivory-dark text-charcoal',
  }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-sm border px-4 py-3 text-sm', tones[tone])}>
      {children}
    </div>
  )
}

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' })

export function formatDateTime(value: string | null | undefined) {
  return value ? `${dateFormat.format(new Date(value))} ET` : 'never'
}
