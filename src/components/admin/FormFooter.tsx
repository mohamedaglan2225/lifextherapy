import type { FormState } from '@/app/admin/actions/state'
import { cn } from '@/lib/cn'

const buttonBase =
  'inline-flex items-center justify-center rounded-sm px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-premium duration-[var(--lx-fast)] disabled:cursor-not-allowed disabled:opacity-50'

export const primaryButton = cn(buttonBase, 'bg-charcoal text-ivory hover:bg-bronze')
export const secondaryButton = cn(buttonBase, 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory')
export const dangerButton = cn(buttonBase, 'border border-red-800 text-red-800 hover:bg-red-800 hover:text-ivory')

export function FormMessage({ state }: { state: FormState }) {
  return (
    <p
      role={state.status === 'error' ? 'alert' : 'status'}
      className={cn(
        'min-h-5 text-sm',
        state.status === 'error' && 'font-medium text-red-800',
        state.status === 'success' && 'font-medium text-emerald-800',
      )}
    >
      {state.message}
    </p>
  )
}

/** Save-as-draft and publish buttons shared by every editor. */
export function FormFooter({
  state,
  pending,
  uploading,
  publishLabel = 'Save & publish',
}: {
  state: FormState
  pending: boolean
  uploading: boolean
  publishLabel?: string
}) {
  const disabled = pending || uploading
  return (
    <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-sm border border-border bg-offwhite/95 px-6 py-4 shadow-[0_12px_32px_-20px_rgba(29,27,25,0.5)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <FormMessage state={state} />
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
        <button type="submit" name="intent" value="draft" disabled={disabled} className={secondaryButton}>
          {pending ? 'Saving…' : 'Save draft'}
        </button>
        <button type="submit" name="intent" value="publish" disabled={disabled} className={primaryButton}>
          {uploading ? 'Uploading image…' : pending ? 'Working…' : publishLabel}
        </button>
      </div>
    </div>
  )
}
