'use client'

import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

/** Submit button that asks for confirmation first; used for destructive actions. */
export function ConfirmButton({
  children,
  confirmMessage,
  className,
}: {
  children: ReactNode
  confirmMessage?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault()
      }}
    >
      {pending ? 'Working…' : children}
    </button>
  )
}
