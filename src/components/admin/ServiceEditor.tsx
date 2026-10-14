'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deleteDocument } from '@/app/admin/actions/documents'
import { SEO_FIELDS, SERVICE_FIELDS, SESSIONS_FIELD, type ServiceDoc } from '@/lib/cms/documents'
import { DocumentActions, DocumentStatus, HistoryPanel, useDocument, type DocumentProps } from './DocumentEditor'
import { useDirtyGuard } from './DirtyGuard'
import { EditorOptionsProvider, FieldControl, FieldError, FieldsForm, Label, type EditorOptions } from './fields'
import { buttons, inputClass, Notice, Panel } from './ui'

export function ServiceEditor({ props, options }: { props: DocumentProps; options: EditorOptions }) {
  const doc = useDocument(props)
  const router = useRouter()
  const { setDirty } = useDirtyGuard()
  const [deleting, startDelete] = useTransition()
  const [slugUnlocked, setSlugUnlocked] = useState(false)
  const service = doc.data as unknown as ServiceDoc
  const set = (patch: Partial<ServiceDoc>) => doc.setData({ ...doc.data, ...patch })
  const liveSlug = (props.publishedData as ServiceDoc | null)?.slug

  const remove = () => {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) return
    startDelete(async () => {
      const result = await deleteDocument('service', props.docKey, doc.version)
      if (result.ok) {
        setDirty(false)
        router.push('/admin/services')
      } else window.alert(result.message)
    })
  }

  return (
    <EditorOptionsProvider value={options}>
      <DocumentStatus doc={doc} props={props} />
      <div className="flex flex-col gap-6">
        <Panel title="Address and visibility">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service-slug" hint="The page address. Changing a published address keeps the old one working as a permanent redirect.">
              Page address
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-bronze-dark">/services/</span>
              <input
                id="service-slug"
                value={service.slug}
                readOnly={!slugUnlocked}
                onChange={(event) => set({ slug: event.target.value.toLowerCase() })}
                aria-invalid={doc.errors.slug ? true : undefined}
                className={`${inputClass} sm:max-w-sm ${slugUnlocked ? '' : 'bg-ivory-dark text-bronze-dark'}`}
              />
              {!slugUnlocked && (
                <button
                  type="button"
                  className={buttons.quiet}
                  onClick={() => {
                    if (!liveSlug || window.confirm('Change this service’s address? Links to the current address will redirect to the new one.')) setSlugUnlocked(true)
                  }}
                >
                  Change address
                </button>
              )}
            </div>
            <FieldError message={doc.errors.slug} />
            {liveSlug && liveSlug !== service.slug && (
              <Notice tone="warning">When you publish, /services/{liveSlug} will permanently redirect to /services/{service.slug || '…'}.</Notice>
            )}
            {service.previousSlugs.length > 0 && (
              <p className="text-xs text-bronze-dark">Old addresses that redirect here: {service.previousSlugs.map((slug) => `/services/${slug}`).join(', ')}</p>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="service-status" hint="Archived services leave the website; their address redirects to the services page.">
                Status
              </Label>
              <select id="service-status" value={service.status} onChange={(event) => set({ status: event.target.value as ServiceDoc['status'] })} className={inputClass}>
                <option value="active">Active (shown on the website)</option>
                <option value="archived">Archived (hidden)</option>
              </select>
            </div>
            <FieldControl
              field={{ kind: 'number', name: 'sortOrder', label: 'Order', min: 0, max: 999, hint: 'Lower numbers appear first. You can also reorder from the services list.' }}
              value={service.sortOrder}
              onChange={(sortOrder) => set({ sortOrder: sortOrder as number })}
              errors={doc.errors}
              path="sortOrder"
            />
          </div>
        </Panel>

        <Panel title="Sessions, prices and booking" description="Each session can have its own Vagaro link. Existing links are kept exactly as they were.">
          <FieldControl field={SESSIONS_FIELD} value={service.sessions} onChange={(sessions) => set({ sessions: sessions as ServiceDoc['sessions'] })} errors={doc.errors} path="sessions" />
        </Panel>

        <Panel title="Content">
          <FieldsForm fields={SERVICE_FIELDS} value={doc.data} onChange={(next) => doc.setData(next)} errors={doc.errors} path="" />
        </Panel>

        <Panel title="Search & sharing">
          <FieldsForm fields={SEO_FIELDS} value={service.seo as unknown as Record<string, unknown>} onChange={(seo) => set({ seo: seo as ServiceDoc['seo'] })} errors={doc.errors} path="seo" />
        </Panel>
      </div>
      <DocumentActions
        doc={doc}
        props={props}
        extra={
          !props.publishedData ? (
            <button type="button" className={buttons.danger} onClick={remove} disabled={deleting}>
              Delete service
            </button>
          ) : null
        }
      />
      <HistoryPanel doc={doc} revisions={props.revisions} />
    </EditorOptionsProvider>
  )
}
