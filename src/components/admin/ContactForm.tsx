'use client'

import { useState } from 'react'
import { saveContact } from '@/app/admin/actions/content'
import type { Contact } from '@/lib/cms/schema'
import { inputClasses, Panel, TextField } from './fields'
import { FormFooter } from './FormFooter'
import { useCmsForm } from './useCmsForm'

let nextRowId = 0

export function ContactForm({ contact }: { contact: Contact }) {
  const { state, onSubmit, pending, uploading } = useCmsForm(saveContact)
  const errors = state.fieldErrors
  const [rows, setRows] = useState(() => contact.hours.map((entry) => ({ ...entry, id: nextRowId++ })))

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <Panel title="Contact details" description="Shown on the Contact page and used by the Call and Email buttons.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Phone" name="phone" type="tel" defaultValue={contact.phone} maxLength={40} required error={errors.phone} />
          <TextField
            label="Email"
            name="email"
            type="email"
            defaultValue={contact.email}
            maxLength={254}
            error={errors.email}
            hint="Leave empty to keep the email placeholder."
          />
        </div>
        <TextField label="Address" name="address" defaultValue={contact.address} maxLength={200} required error={errors.address} />
      </Panel>

      <Panel title="Business hours">
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Business hours</legend>
          {rows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
              <input
                name="hoursDay"
                aria-label={`Day or days, row ${index + 1}`}
                defaultValue={row.day}
                maxLength={40}
                className={inputClasses}
              />
              <input
                name="hoursValue"
                aria-label={`Hours, row ${index + 1}`}
                defaultValue={row.hours}
                maxLength={60}
                className={inputClasses}
              />
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                disabled={rows.length === 1}
                className="px-2 text-xs font-medium text-red-800 underline underline-offset-4 disabled:opacity-40"
              >
                Remove<span className="sr-only"> row {index + 1}</span>
              </button>
            </div>
          ))}
        </fieldset>
        {errors.hours && <p className="text-xs font-medium text-red-800">{errors.hours}</p>}
        <button
          type="button"
          onClick={() => setRows((current) => [...current, { day: '', hours: '', id: nextRowId++ }])}
          disabled={rows.length >= 7}
          className="self-start text-xs font-semibold uppercase tracking-[0.12em] text-bronze underline underline-offset-4 disabled:opacity-40"
        >
          Add a row
        </button>
      </Panel>

      <Panel title="Social links" description="Leave a link empty to keep its placeholder icon.">
        <TextField
          label="Instagram"
          name="instagramUrl"
          type="url"
          placeholder="https://www.instagram.com/…"
          defaultValue={contact.instagramUrl}
          maxLength={500}
          error={errors.instagramUrl}
        />
        <TextField
          label="Facebook"
          name="facebookUrl"
          type="url"
          placeholder="https://www.facebook.com/…"
          defaultValue={contact.facebookUrl}
          maxLength={500}
          error={errors.facebookUrl}
        />
      </Panel>

      <FormFooter state={state} pending={pending} uploading={uploading} />
    </form>
  )
}
