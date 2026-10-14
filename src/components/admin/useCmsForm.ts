'use client'

import { useActionState, useState, useTransition, type FormEvent } from 'react'
import { initialFormState, type FormState } from '@/app/admin/actions/state'

/**
 * Runs a Server Action from a form without React's automatic form reset, so a
 * validation error never wipes what the owner typed. The clicked button's
 * `intent` (draft or publish) is submitted with the form.
 */
export function useCmsForm(action: (state: FormState, formData: FormData) => Promise<FormState>) {
  const [state, dispatch, actionPending] = useActionState(action, initialFormState)
  const [transitionPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const formData = new FormData(event.currentTarget, submitter)
    startTransition(() => dispatch(formData))
  }

  return { state, onSubmit, pending: actionPending || transitionPending, uploading, setUploading }
}
