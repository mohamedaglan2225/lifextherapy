'use client'

import { buttons } from '@/components/admin/ui'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-sm border border-red-800/30 bg-offwhite p-8">
      <h1 className="font-serif text-3xl text-charcoal">Something went wrong</h1>
      <p className="mt-3 text-sm text-bronze-dark">{error.message || 'Please try again.'}</p>
      <p className="mt-1 text-xs text-bronze-dark">Nothing was published. If this keeps happening, sign out and back in.</p>
      <button type="button" onClick={reset} className={`${buttons.secondary} mt-6`}>
        Try again
      </button>
    </div>
  )
}
