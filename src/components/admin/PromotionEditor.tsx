'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { deleteDocument, unpublishDocument } from '@/app/admin/actions/documents'
import { PROMOTION_FIELDS, SITE_TIME_ZONE, type PromotionDoc } from '@/lib/cms/documents'
import { PAGE_DEFS, PAGE_KEYS, type PageKey } from '@/lib/cms/sections'
import { utcToZonedInput, zonedInputToUtc } from '@/lib/cms/time'
import { DocumentActions, DocumentStatus, HistoryPanel, useDocument, type DocumentProps } from './DocumentEditor'
import { useDirtyGuard } from './DirtyGuard'
import { EditorOptionsProvider, FieldControl, FieldError, FieldsForm, type EditorOptions } from './fields'
import { buttons, inputClass, Notice, Panel } from './ui'

export function PromotionEditor({
  props,
  options,
  pagesWithSlot,
  refreshMinutes,
}: {
  props: DocumentProps
  options: EditorOptions
  pagesWithSlot: PageKey[]
  refreshMinutes: number
}) {
  const doc = useDocument(props)
  const router = useRouter()
  const { setDirty } = useDirtyGuard()
  const [busy, startBusy] = useTransition()
  const promotion = doc.data as unknown as PromotionDoc
  const set = (patch: Partial<PromotionDoc>) => doc.setData({ ...doc.data, ...patch })
  const pages = PAGE_KEYS.filter((key) => key !== 'service')

  const hide = () =>
    startBusy(async () => {
      const result = await unpublishDocument('promotion', props.docKey)
      window.alert(result.message)
      if (result.ok) router.refresh()
    })
  const remove = () => {
    if (!window.confirm(`Delete "${promotion.title}"? This cannot be undone.`)) return
    startBusy(async () => {
      const result = await deleteDocument('promotion', props.docKey, doc.version)
      if (result.ok) {
        setDirty(false)
        router.push('/admin/promotions')
      } else window.alert(result.message)
    })
  }

  const missingSlot = promotion.placements.filter((page) => !pagesWithSlot.includes(page))

  return (
    <EditorOptionsProvider value={options}>
      <DocumentStatus doc={doc} props={props} />
      <div className="flex flex-col gap-6">
        <Panel title="Promotion">
          <FieldsForm fields={PROMOTION_FIELDS} value={doc.data} onChange={(next) => doc.setData(next)} errors={doc.errors} path="" />
        </Panel>

        <Panel title="Where it appears">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">Pages</legend>
            {pages.map((page) => (
              <label key={page} className="flex items-center gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#9a7955]"
                  checked={promotion.placements.includes(page)}
                  onChange={(event) =>
                    set({ placements: event.target.checked ? [...promotion.placements, page] : promotion.placements.filter((item) => item !== page) })
                  }
                />
                {PAGE_DEFS[page].label}
                {!pagesWithSlot.includes(page) && <span className="text-xs text-bronze-dark">(add a Promotions section to this page first)</span>}
              </label>
            ))}
          </fieldset>
          <FieldError message={doc.errors.placements} />
          {missingSlot.length > 0 && (
            <Notice tone="warning">
              {missingSlot.map((page) => PAGE_DEFS[page].label).join(', ')} {missingSlot.length === 1 ? 'has' : 'have'} no Promotions section, so it will not show there.
              Add one under Pages.
            </Notice>
          )}
          <FieldControl
            field={{ kind: 'number', name: 'sortOrder', label: 'Order', min: 0, max: 999, hint: 'Lower numbers appear first.' }}
            value={promotion.sortOrder}
            onChange={(sortOrder) => set({ sortOrder: sortOrder as number })}
            errors={doc.errors}
            path="sortOrder"
          />
        </Panel>

        <Panel
          title="Schedule"
          description={
            <>
              Times are Eastern Time (New York). Leave both empty to show the promotion as soon as it is published, until you hide it. A start or end
              takes effect on the website within {refreshMinutes} minutes; an ended promotion also disappears from open pages at the exact end time.
            </>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {(['startsAt', 'endsAt'] as const).map((name) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label htmlFor={`promotion-${name}`} className="text-xs font-semibold uppercase tracking-[0.1em] text-charcoal">
                  {name === 'startsAt' ? 'Starts (optional)' : 'Ends (optional)'}
                </label>
                <div className="flex gap-2">
                  <input
                    id={`promotion-${name}`}
                    type="datetime-local"
                    value={utcToZonedInput(promotion[name], SITE_TIME_ZONE)}
                    onChange={(event) => set({ [name]: zonedInputToUtc(event.target.value, SITE_TIME_ZONE) } as Partial<PromotionDoc>)}
                    aria-invalid={doc.errors[name] ? true : undefined}
                    className={inputClass}
                  />
                  {promotion[name] && (
                    <button type="button" className={buttons.link} onClick={() => set({ [name]: '' } as Partial<PromotionDoc>)}>
                      Clear
                    </button>
                  )}
                </div>
                <FieldError message={doc.errors[name]} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <DocumentActions
        doc={doc}
        props={props}
        extra={
          <>
            {props.publishedData && (
              <button type="button" className={buttons.secondary} onClick={hide} disabled={busy || doc.dirty}>
                Hide from website
              </button>
            )}
            <button type="button" className={buttons.danger} onClick={remove} disabled={busy}>
              Delete
            </button>
          </>
        }
      />
      <HistoryPanel doc={doc} revisions={props.revisions} />
    </EditorOptionsProvider>
  )
}
