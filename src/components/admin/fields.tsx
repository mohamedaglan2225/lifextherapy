import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const inputClasses =
  'w-full rounded-sm border border-border bg-offwhite px-3 py-2.5 text-sm text-charcoal placeholder:text-bronze-dark/60 focus:border-bronze aria-[invalid=true]:border-red-700'

type FieldProps = {
  label: string
  name: string
  hint?: ReactNode
  error?: string
}

function FieldShell({ label, name, hint, error, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${name}-hint`} className="text-xs font-light text-bronze-dark">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-xs font-medium text-red-800">
          {error}
        </p>
      )}
    </div>
  )
}

function describedBy(name: string, hint?: ReactNode, error?: string) {
  if (error) return `${name}-error`
  if (hint) return `${name}-hint`
  return undefined
}

export function TextField({
  label,
  name,
  hint,
  error,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} name={name} hint={hint} error={error}>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={cn(inputClasses, className)}
        {...props}
      />
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  name,
  hint,
  error,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} name={name} hint={hint} error={error}>
      <textarea
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={cn(inputClasses, 'min-h-24 leading-relaxed', className)}
        {...props}
      />
    </FieldShell>
  )
}

export function Panel({ title, children, description }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-sm border border-border bg-offwhite p-6 lg:p-8">
      <h2 className="font-serif text-2xl text-charcoal">{title}</h2>
      {description && <p className="mt-1 text-sm font-light text-bronze-dark">{description}</p>}
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </section>
  )
}
