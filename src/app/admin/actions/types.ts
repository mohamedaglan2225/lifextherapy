import type { ZodError } from 'zod'

export type ActionResult = {
  ok: boolean
  message: string
  /** New draft version after a save. */
  version?: number
  /** Field errors keyed by dotted path, e.g. `sections.2.data.title`. */
  fieldErrors?: Record<string, string>
  /** Another editor saved first; reload before saving again. */
  conflict?: boolean
  /** The database publish succeeded but the live-site cache refresh failed. */
  refreshFailed?: boolean
  published?: boolean
  key?: string
  /** Data as saved (after server-side normalisation, e.g. service address history). */
  data?: Record<string, unknown>
}

export function fieldErrorsFrom(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.map(String).join('.') || 'form'
    errors[path] ??= issue.message
  }
  return errors
}

export const sessionEnded: ActionResult = { ok: false, message: 'Your session has ended. Sign in again in another tab, then try again.' }
