'use client'

import type { PageDoc, Section } from '@/lib/cms/documents'
import { SEO_FIELDS } from '@/lib/cms/documents'
import { PAGE_DEFS, type PageKey } from '@/lib/cms/sections'
import { DocumentActions, DocumentStatus, HistoryPanel, useDocument, type DocumentProps } from './DocumentEditor'
import { EditorOptionsProvider, FieldsForm, type EditorOptions } from './fields'
import { SectionsEditor } from './SectionsEditor'
import { Panel } from './ui'

export function PageEditor({ props, options }: { props: DocumentProps; options: EditorOptions }) {
  const doc = useDocument(props)
  const page = props.docKey as PageKey
  const def = PAGE_DEFS[page]
  const data = doc.data as unknown as PageDoc

  return (
    <EditorOptionsProvider value={options}>
      <DocumentStatus doc={doc} props={props} />
      <div className="flex flex-col gap-6">
        {def.hasSeo && (
          <Panel title="Search & sharing" description={`How ${def.label} appears in search results and when shared.`}>
            <FieldsForm
              fields={SEO_FIELDS}
              value={data.seo as unknown as Record<string, unknown>}
              onChange={(seo) => doc.setData({ ...doc.data, seo })}
              errors={doc.errors}
              path="seo"
            />
            {def.legal && (
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={data.indexable}
                  onChange={(event) => doc.setData({ ...doc.data, indexable: event.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-[#9a7955]"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-charcoal">Ready for search engines</span>
                  <span className="text-xs font-light text-bronze-dark">
                    Leave off while the text is a placeholder. When on, the page is indexed and listed in the sitemap.
                  </span>
                </span>
              </label>
            )}
          </Panel>
        )}
        <Panel title="Sections" description="Open a section to edit it. Use the arrows to reorder.">
          <SectionsEditor page={page} sections={data.sections} onChange={(sections: Section[]) => doc.setData({ ...doc.data, sections })} errors={doc.errors} />
        </Panel>
      </div>
      <DocumentActions doc={doc} props={props} />
      <HistoryPanel doc={doc} revisions={props.revisions} />
    </EditorOptionsProvider>
  )
}
