'use client'

import { useState } from 'react'
import { defaultContent } from '@/lib/cms/defaults'
import type { Section } from '@/lib/cms/documents'
import { emptyObject } from '@/lib/cms/fields'
import { PAGE_DEFS, PAGE_KEYS, SECTION_DEFS, sectionAllowedOn, type PageKey, type SectionType } from '@/lib/cms/sections'
import { cn } from '@/lib/cn'
import { FieldsForm, hasErrorsUnder, moveItem, type Errors } from './fields'
import { Badge, buttons, inputClass } from './ui'

/** Starting content for a newly added section: template defaults, else the site's own copy. */
function newSectionData(type: SectionType) {
  const def = SECTION_DEFS[type]
  if (def.templateDefaults) return structuredClone(def.templateDefaults)
  for (const key of PAGE_KEYS) {
    const existing = defaultContent.pages[key].sections.find((section) => section.type === type)
    if (existing) return structuredClone(existing.data)
  }
  return emptyObject(def.fields)
}

export function SectionsEditor({
  page,
  sections,
  onChange,
  errors,
}: {
  page: PageKey
  sections: Section[]
  onChange: (sections: Section[]) => void
  errors: Errors
}) {
  const pageDef = PAGE_DEFS[page]
  const [open, setOpen] = useState<string | null>(null)
  const [adding, setAdding] = useState<SectionType | ''>('')

  const addable = (Object.keys(SECTION_DEFS) as SectionType[]).filter((type) => {
    const def = SECTION_DEFS[type]
    if (!sectionAllowedOn(def, page)) return false
    if (def.singleton && sections.some((section) => section.type === type)) return false
    return true
  })
  const templates = addable.filter((type) => SECTION_DEFS[type].template)
  const siteSections = addable.filter((type) => !SECTION_DEFS[type].template)

  const update = (index: number, patch: Partial<Section>) => onChange(sections.map((section, i) => (i === index ? { ...section, ...patch } : section)))

  const add = () => {
    if (!adding) return
    const section: Section = { id: crypto.randomUUID(), type: adding, hidden: false, data: newSectionData(adding) as Record<string, unknown> }
    // New sections go just above the closing call to action when there is one.
    const ctaIndex = sections.findLastIndex((existing) => existing.type === 'cta')
    const at = ctaIndex > 0 && ctaIndex === sections.length - 1 ? ctaIndex : sections.length
    onChange([...sections.slice(0, at), section, ...sections.slice(at)])
    setOpen(section.id)
    setAdding('')
  }

  return (
    <div className="flex flex-col gap-3">
      {errors.sections && <p className="text-sm font-medium text-red-800">{errors.sections}</p>}
      {sections.map((section, index) => {
        const def = SECTION_DEFS[section.type]
        const required = pageDef.required.includes(section.type)
        const pinned = pageDef.first === section.type
        const path = `sections.${index}`
        const invalid = hasErrorsUnder(errors, path)
        const isOpen = open === section.id
        const canMoveUp = index > 0 && !pinned && !(index === 1 && pageDef.first)
        const canMoveDown = index < sections.length - 1 && !pinned
        const title = String((section.data as Record<string, unknown>).title ?? (section.data as Record<string, unknown>).eyebrow ?? '').split('\n')[0].replace(/\*/g, '')

        return (
          <div key={section.id} className={cn('rounded-sm border bg-offwhite', invalid ? 'border-red-700' : 'border-border', section.hidden && 'opacity-70')}>
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
              <button type="button" onClick={() => setOpen(isOpen ? null : section.id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span aria-hidden="true" className="text-bronze">{isOpen ? '▾' : '▸'}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-charcoal">{def.label}</span>
                  {title && <span className="block truncate text-xs text-bronze-dark">{title}</span>}
                </span>
              </button>
              <span className="flex flex-wrap gap-1">
                {required && <Badge tone="draft">Required</Badge>}
                {section.hidden && <Badge tone="changed">Hidden</Badge>}
                {invalid && <Badge tone="danger">Needs attention</Badge>}
              </span>
              <span className="flex gap-1">
                <button type="button" className={buttons.icon} disabled={!canMoveUp} onClick={() => onChange(moveItem(sections, index, index - 1))} aria-label={`Move ${def.label} up`}>
                  ↑
                </button>
                <button
                  type="button"
                  className={buttons.icon}
                  disabled={!canMoveDown}
                  onClick={() => onChange(moveItem(sections, index, index + 1))}
                  aria-label={`Move ${def.label} down`}
                >
                  ↓
                </button>
              </span>
            </div>

            {isOpen && (
              <div className="border-t border-border px-4 py-5">
                <p className="mb-5 text-xs font-light text-bronze-dark">{def.description}</p>
                <FieldsForm
                  fields={def.fields}
                  value={section.data as Record<string, unknown>}
                  onChange={(data) => update(index, { data })}
                  errors={errors}
                  path={`${path}.data`}
                />
                <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                  {required ? (
                    <p className="text-xs text-bronze-dark">This section is required on this page, so it cannot be hidden or removed.</p>
                  ) : (
                    <>
                      <button type="button" className={buttons.quiet} onClick={() => update(index, { hidden: !section.hidden })}>
                        {section.hidden ? 'Show on page' : 'Hide from page'}
                      </button>
                      {!def.singleton && (
                        <button
                          type="button"
                          className={buttons.quiet}
                          onClick={() => {
                            const copy: Section = { ...structuredClone(section), id: crypto.randomUUID() }
                            onChange([...sections.slice(0, index + 1), copy, ...sections.slice(index + 1)])
                            setOpen(copy.id)
                          }}
                        >
                          Duplicate
                        </button>
                      )}
                      <button
                        type="button"
                        className={buttons.danger}
                        onClick={() => {
                          if (window.confirm(`Remove the "${def.label}" section from this page? You can undo this by discarding your changes before saving.`)) {
                            onChange(sections.filter((_, i) => i !== index))
                          }
                        }}
                      >
                        Remove section
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div className="flex flex-col gap-2 rounded-sm border border-dashed border-border p-4 sm:flex-row sm:items-center">
        <label htmlFor={`add-section-${page}`} className="text-sm font-semibold text-charcoal">
          Add a section
        </label>
        <select id={`add-section-${page}`} value={adding} onChange={(event) => setAdding(event.target.value as SectionType)} className={cn(inputClass, 'sm:max-w-sm')}>
          <option value="">Choose a section type…</option>
          {templates.length > 0 && (
            <optgroup label="Templates">
              {templates.map((type) => (
                <option key={type} value={type}>
                  {SECTION_DEFS[type].label}
                </option>
              ))}
            </optgroup>
          )}
          {siteSections.length > 0 && (
            <optgroup label="Website sections">
              {siteSections.map((type) => (
                <option key={type} value={type}>
                  {SECTION_DEFS[type].label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <button type="button" className={buttons.secondary} onClick={add} disabled={!adding}>
          Add
        </button>
      </div>
      {adding && <p className="text-xs text-bronze-dark">{SECTION_DEFS[adding].description}</p>}
    </div>
  )
}
