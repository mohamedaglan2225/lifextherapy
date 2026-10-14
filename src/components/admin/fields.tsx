'use client'

import { createContext, useContext, useId, useState, type ReactNode } from 'react'
import { emptyObject, emptyValue, ICON_NAMES, type ButtonValue, type Field, type ImageValue, type LinkValue } from '@/lib/cms/fields'
import { cn } from '@/lib/cn'
import { ImageInput } from './ImageInput'
import { buttons, inputClass } from './ui'

export type Errors = Record<string, string>

/** Data the field controls need from the page: service choices and image previews. */
export type EditorOptions = {
  services: Array<{ slug: string; name: string }>
  previews: Record<string, string>
}
const EditorOptionsContext = createContext<EditorOptions>({ services: [], previews: {} })
export function EditorOptionsProvider({ value, children }: { value: EditorOptions; children: ReactNode }) {
  return <EditorOptionsContext.Provider value={value}>{children}</EditorOptionsContext.Provider>
}
export function useEditorOptions() {
  return useContext(EditorOptionsContext)
}

export function hasErrorsUnder(errors: Errors, path: string) {
  return Object.keys(errors).some((key) => key === path || key.startsWith(`${path}.`))
}

function idFor(path: string) {
  return `field-${path.replace(/[^a-zA-Z0-9]+/g, '-')}`
}

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">
        {children}
      </label>
      {hint && <span className="text-xs font-light text-bronze-dark">{hint}</span>}
    </div>
  )
}

export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-xs font-medium text-red-800">
      {message}
    </p>
  )
}

function TextInput({
  id,
  value,
  onChange,
  error,
  multiline,
  rows = 3,
  max,
  placeholder,
  type = 'text',
  ariaLabel,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
  multiline?: boolean
  rows?: number
  max?: number
  placeholder?: string
  type?: string
  ariaLabel?: string
}) {
  const props = {
    id,
    value,
    placeholder,
    maxLength: max,
    'aria-label': ariaLabel,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
    className: cn(inputClass, multiline && 'leading-relaxed'),
  }
  return multiline ? (
    <textarea {...props} rows={rows} onChange={(event) => onChange(event.target.value)} />
  ) : (
    <input {...props} type={type} onChange={(event) => onChange(event.target.value)} />
  )
}

function Counter({ value, max }: { value: string; max: number }) {
  if (value.length < max * 0.8) return null
  return <span className="text-[11px] text-bronze-dark">{value.length}/{max}</span>
}

type ControlProps = { field: Field; value: unknown; onChange: (value: unknown) => void; errors: Errors; path: string }

export function FieldControl({ field, value, onChange, errors, path }: ControlProps) {
  const id = idFor(path)
  const error = errors[path]
  const { services } = useEditorOptions()

  switch (field.kind) {
    case 'text':
    case 'textarea':
    case 'display': {
      const text = (value as string) ?? ''
      const multiline = field.kind !== 'text'
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} hint={field.hint}>
            {field.label}
            {'required' in field && field.required ? '' : ' (optional)'}
          </Label>
          <TextInput
            id={id}
            value={text}
            onChange={onChange}
            error={error}
            multiline={multiline}
            rows={field.kind === 'textarea' ? (field.rows ?? 3) : 2}
            max={field.max}
            placeholder={field.kind === 'text' ? field.placeholder : undefined}
          />
          <div className="flex justify-between gap-4">
            <FieldError message={error} id={`${id}-error`} />
            <Counter value={text} max={field.max} />
          </div>
        </div>
      )
    }
    case 'url':
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} hint={field.hint}>
            {field.label}
            {field.required ? '' : ' (optional)'}
          </Label>
          <TextInput id={id} type="url" value={(value as string) ?? ''} onChange={onChange} error={error} max={500} placeholder={field.placeholder ?? 'https://'} />
          <FieldError message={error} id={`${id}-error`} />
        </div>
      )
    case 'number':
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} hint={field.hint}>
            {field.label}
          </Label>
          <div className="flex items-center gap-2">
            {field.prefix && <span className="text-sm text-bronze-dark">{field.prefix}</span>}
            <input
              id={id}
              type="number"
              inputMode="numeric"
              min={field.min}
              max={field.max}
              value={typeof value === 'number' && Number.isFinite(value) ? value : ''}
              onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
              aria-invalid={error ? true : undefined}
              className={cn(inputClass, 'max-w-32')}
            />
            {field.suffix && <span className="text-sm text-bronze-dark">{field.suffix}</span>}
          </div>
          <FieldError message={error} />
        </div>
      )
    case 'toggle':
      return (
        <label htmlFor={id} className="flex items-start gap-3">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#9a7955]" />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-charcoal">{field.label}</span>
            {field.hint && <span className="text-xs font-light text-bronze-dark">{field.hint}</span>}
          </span>
        </label>
      )
    case 'select':
    case 'icon':
    case 'service': {
      const options =
        field.kind === 'select'
          ? field.options
          : field.kind === 'icon'
            ? ICON_NAMES.map((name) => ({ value: name, label: name.charAt(0).toUpperCase() + name.slice(1) }))
            : [{ value: '', label: 'Choose a service…' }, ...services.map((service) => ({ value: service.slug, label: service.name }))]
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} hint={field.hint}>
            {field.label}
          </Label>
          <select
            id={id}
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={error ? true : undefined}
            className={inputClass}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={error} />
        </div>
      )
    }
    case 'link': {
      const link = (value as LinkValue) ?? { label: '', href: '' }
      const update = (patch: Partial<LinkValue>) => onChange({ ...link, ...patch })
      return (
        <fieldset className="flex flex-col gap-2 rounded-sm border border-border p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">
            {field.label}
            {field.required ? '' : ' (optional)'}
          </legend>
          {field.hint && <p className="text-xs font-light text-bronze-dark">{field.hint}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${id}-label`}>Text</Label>
              <TextInput id={`${id}-label`} value={link.label} onChange={(label) => update({ label })} error={errors[`${path}.label`]} max={80} />
              <FieldError message={errors[`${path}.label`]} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${id}-href`}>Link</Label>
              <TextInput id={`${id}-href`} value={link.href} onChange={(href) => update({ href })} error={errors[`${path}.href`]} max={500} placeholder="/services or https://…" />
              <FieldError message={errors[`${path}.href`]} />
            </div>
          </div>
          {field.ariaLabel && (
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${id}-aria`} hint="Optional. Read aloud by screen readers instead of the link text.">
                Screen reader label
              </Label>
              <TextInput id={`${id}-aria`} value={link.ariaLabel ?? ''} onChange={(ariaLabel) => update({ ariaLabel })} max={120} />
            </div>
          )}
          <FieldError message={error} />
        </fieldset>
      )
    }
    case 'button': {
      const button = (value as ButtonValue) ?? { label: '', action: 'link', href: '' }
      const update = (patch: Partial<ButtonValue>) => onChange({ ...button, ...patch })
      return (
        <fieldset className="flex flex-col gap-2 rounded-sm border border-border p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">
            {field.label}
            {field.required ? '' : ' (optional — leave the text empty for no button)'}
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${id}-label`}>Text</Label>
              <TextInput id={`${id}-label`} value={button.label} onChange={(label) => update({ label })} error={errors[`${path}.label`]} max={60} />
              <FieldError message={errors[`${path}.label`]} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${id}-action`}>Opens</Label>
              <select id={`${id}-action`} value={button.action} onChange={(event) => update({ action: event.target.value as ButtonValue['action'] })} className={inputClass}>
                <option value="booking">Vagaro booking page</option>
                <option value="link">A link</option>
              </select>
            </div>
            {button.action === 'link' && (
              <div className="flex flex-col gap-1">
                <Label htmlFor={`${id}-href`}>Link</Label>
                <TextInput id={`${id}-href`} value={button.href} onChange={(href) => update({ href })} error={errors[`${path}.href`]} max={500} placeholder="/services or https://…" />
                <FieldError message={errors[`${path}.href`]} />
              </div>
            )}
          </div>
          <FieldError message={error} />
        </fieldset>
      )
    }
    case 'image':
      return (
        <ImageInput
          id={id}
          label={field.label}
          hint={field.hint}
          required={field.required}
          decorative={field.decorative}
          value={(value as ImageValue) ?? { src: '', alt: '' }}
          onChange={onChange}
          error={error ?? errors[`${path}.src`]}
          altError={errors[`${path}.alt`]}
        />
      )
    case 'strings':
      return <StringsControl field={field} value={(value as string[]) ?? []} onChange={onChange} errors={errors} path={path} />
    case 'list':
      return <ListControl field={field} value={(value as Array<Record<string, unknown>>) ?? []} onChange={onChange} errors={errors} path={path} />
  }
}

export function FieldsForm({
  fields,
  value,
  onChange,
  errors,
  path,
}: {
  fields: Field[]
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
  errors: Errors
  path: string
}) {
  return (
    <div className="flex flex-col gap-5">
      {fields.map((field) => (
        <FieldControl
          key={field.name}
          field={field}
          value={value?.[field.name] ?? emptyValue(field)}
          onChange={(next) => onChange({ ...value, [field.name]: next })}
          errors={errors}
          path={path ? `${path}.${field.name}` : field.name}
        />
      ))}
    </div>
  )
}

export function MoveButtons({
  index,
  count,
  onMove,
  label,
}: {
  index: number
  count: number
  onMove: (from: number, to: number) => void
  label: string
}) {
  return (
    <>
      <button type="button" className={buttons.icon} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${label} up`}>
        ↑
      </button>
      <button type="button" className={buttons.icon} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${label} down`}>
        ↓
      </button>
    </>
  )
}

export function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function StringsControl({ field, value, onChange, errors, path }: ControlProps & { field: Extract<Field, { kind: 'strings' }>; value: string[] }) {
  const groupId = useId()
  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={field.hint ? `${groupId}-hint` : undefined}>
      <legend className="text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">{field.label}</legend>
      {field.hint && (
        <p id={`${groupId}-hint`} className="-mt-2 text-xs font-light text-bronze-dark">
          {field.hint}
        </p>
      )}
      {value.map((item, index) => {
        const itemPath = `${path}.${index}`
        const label = `${field.itemLabel} ${index + 1}`
        return (
          <div key={index} className="flex items-start gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <TextInput
                id={idFor(itemPath)}
                ariaLabel={label}
                value={item}
                onChange={(next) => onChange(value.map((entry, entryIndex) => (entryIndex === index ? next : entry)))}
                error={errors[itemPath]}
                multiline={field.multiline}
                rows={3}
                max={field.maxLength}
              />
              <FieldError message={errors[itemPath]} />
            </div>
            <div className="flex shrink-0 gap-1">
              <MoveButtons index={index} count={value.length} onMove={(from, to) => onChange(moveItem(value, from, to))} label={label} />
              <button
                type="button"
                className={buttons.icon}
                disabled={value.length <= (field.minItems ?? 0)}
                onClick={() => onChange(value.filter((_, entryIndex) => entryIndex !== index))}
                aria-label={`Remove ${label}`}
              >
                ×
              </button>
            </div>
          </div>
        )
      })}
      <FieldError message={errors[path]} />
      <button type="button" className={cn(buttons.link, 'self-start')} disabled={value.length >= field.maxItems} onClick={() => onChange([...value, ''])}>
        + Add {field.itemLabel.toLowerCase()}
      </button>
    </fieldset>
  )
}

function ListControl({ field, value, onChange, errors, path }: ControlProps & { field: Extract<Field, { kind: 'list' }>; value: Array<Record<string, unknown>> }) {
  const [open, setOpen] = useState<number | null>(value.length === 1 ? 0 : null)

  const move = (from: number, to: number) => {
    onChange(moveItem(value, from, to))
    if (open === from) setOpen(to)
    else if (open === to) setOpen(from)
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">{field.label}</legend>
      {field.hint && <p className="-mt-1 text-xs font-light text-bronze-dark">{field.hint}</p>}
      {value.map((item, index) => {
        const itemPath = `${path}.${index}`
        const summaryValue = item[field.summary]
        const summaryText =
          typeof summaryValue === 'string' && summaryValue
            ? summaryValue
            : typeof summaryValue === 'number'
              ? String(summaryValue)
              : summaryValue && typeof summaryValue === 'object' && 'label' in summaryValue && (summaryValue as { label: string }).label
                ? (summaryValue as { label: string }).label
                : `${field.itemLabel} ${index + 1}`
        const label = `${field.itemLabel} ${index + 1}`
        const invalid = hasErrorsUnder(errors, itemPath)
        return (
          <div key={index} className={cn('rounded-sm border bg-ivory', invalid ? 'border-red-700' : 'border-border')}>
            <div className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => setOpen(open === index ? null : index)}
                aria-expanded={open === index}
                className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-charcoal"
              >
                <span aria-hidden="true" className="text-bronze">
                  {open === index ? '▾' : '▸'}
                </span>
                <span className="truncate">{summaryText.split('\n')[0]}</span>
                {invalid && <span className="text-xs font-semibold text-red-800">Needs attention</span>}
              </button>
              <MoveButtons index={index} count={value.length} onMove={move} label={label} />
              <button
                type="button"
                className={buttons.icon}
                disabled={value.length >= field.max}
                onClick={() => onChange([...value.slice(0, index + 1), structuredClone(item), ...value.slice(index + 1)])}
                aria-label={`Duplicate ${label}`}
              >
                ⧉
              </button>
              <button
                type="button"
                className={buttons.icon}
                disabled={value.length <= field.min}
                onClick={() => {
                  if (window.confirm(`Remove ${label}?`)) {
                    onChange(value.filter((_, entryIndex) => entryIndex !== index))
                    setOpen(null)
                  }
                }}
                aria-label={`Remove ${label}`}
              >
                ×
              </button>
            </div>
            {open === index && (
              <div className="border-t border-border px-4 py-4">
                <FieldsForm
                  fields={field.fields}
                  value={item}
                  onChange={(next) => onChange(value.map((entry, entryIndex) => (entryIndex === index ? next : entry)))}
                  errors={errors}
                  path={itemPath}
                />
              </div>
            )}
          </div>
        )
      })}
      <FieldError message={errors[path]} />
      <button
        type="button"
        className={cn(buttons.link, 'self-start')}
        disabled={value.length >= field.max}
        onClick={() => {
          onChange([...value, emptyObject(field.fields)])
          setOpen(value.length)
        }}
      >
        + Add {field.itemLabel.toLowerCase()}
      </button>
    </fieldset>
  )
}
