'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { inputClasses } from './fields'
import { primaryButton } from './FormFooter'

/**
 * Signs in from the browser so Supabase's per-IP rate limits apply to each
 * visitor. Whether the account may use the dashboard is decided on the server.
 */
export function LoginForm({ supabaseUrl, publishableKey }: { supabaseUrl: string; publishableKey: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }

    setPending(true)
    setError('')
    const { error: signInError } = await createSupabaseBrowserClient(supabaseUrl, publishableKey).auth.signInWithPassword({
      email,
      password,
    })
    if (signInError) {
      setPending(false)
      setError(
        signInError.status === 429
          ? 'Too many attempts. Wait a few minutes and try again.'
          : 'That email and password do not match an account.',
      )
      return
    }
    router.replace('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={inputClasses} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClasses}
        />
      </div>
      <p role="alert" className="min-h-5 text-sm font-medium text-red-800">
        {error}
      </p>
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
