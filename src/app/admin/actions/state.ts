import type { ZodError } from 'zod'

export type FormState = {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors: Record<string, string>
}

export const initialFormState: FormState = { status: 'idle', message: '', fieldErrors: {} }

export function errorState(message: string, fieldErrors: Record<string, string> = {}): FormState {
  return { status: 'error', message, fieldErrors }
}

export function successState(message: string): FormState {
  return { status: 'success', message, fieldErrors: {} }
}

export const sessionExpired = errorState('Your session has ended. Sign in again to continue.')

/** First message per field, keyed by the top-level field name. */
export function validationState(error: ZodError): FormState {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    fieldErrors[key] ??= issue.message
  }
  return errorState('Please fix the highlighted fields.', fieldErrors)
}

export function formText(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}
