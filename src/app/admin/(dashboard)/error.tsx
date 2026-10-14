'use client'

import { secondaryButton } from '@/components/admin/FormFooter'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-sm border border-red-800/30 bg-offwhite p-8">
      <h1 className="font-serif text-3xl text-charcoal">Something went wrong</h1>
      <p className="mt-3 text-sm text-bronze-dark">{error.message || 'Please try again.'}</p>
      <button type="button" onClick={reset} className={`${secondaryButton} mt-6`}>
        Try again
      </button>
    </div>
  )
}
