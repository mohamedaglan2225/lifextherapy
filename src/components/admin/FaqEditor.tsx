'use client'

import type { FaqsDoc } from '@/lib/cms/documents'
import type { Field } from '@/lib/cms/fields'
import { DocumentActions, DocumentStatus, HistoryPanel, useDocument, type DocumentProps } from './DocumentEditor'
import { EditorOptionsProvider, FieldControl, type EditorOptions } from './fields'
import { Panel } from './ui'

export function FaqEditor({ props, options }: { props: DocumentProps; options: EditorOptions }) {
  const doc = useDocument(props)
  const faqs = doc.data as unknown as FaqsDoc

  const itemsField: Field = {
    kind: 'list',
    name: 'items',
    label: 'Questions',
    itemLabel: 'Question',
    summary: 'question',
    min: 0,
    max: 80,
    hint: 'The order here is the order on the website.',
    fields: [
      { kind: 'text', name: 'question', label: 'Question', max: 200, required: true },
      { kind: 'textarea', name: 'answer', label: 'Answer', max: 2000, required: true, rows: 4 },
      { kind: 'select', name: 'category', label: 'Category', options: faqs.categories.map((category) => ({ value: category, label: category })) },
      { kind: 'toggle', name: 'showOnHome', label: 'Show on home page' },
      { kind: 'toggle', name: 'showOnServices', label: 'Show on service pages' },
    ],
  }

  return (
    <EditorOptionsProvider value={options}>
      <DocumentStatus doc={doc} props={props} />
      <div className="flex flex-col gap-6">
        <Panel title="Categories" description="Questions are grouped under these headings on the FAQ page, in this order.">
          <FieldControl
            field={{ kind: 'strings', name: 'categories', label: 'Categories', itemLabel: 'Category', minItems: 1, maxItems: 12, maxLength: 60 }}
            value={faqs.categories}
            onChange={(categories) => doc.setData({ ...doc.data, categories })}
            errors={doc.errors}
            path="categories"
          />
        </Panel>
        <Panel title="Questions">
          <FieldControl
            field={itemsField}
            value={faqs.items}
            onChange={(items) =>
              doc.setData({
                ...doc.data,
                // New questions get a stable id; the first category is the default.
                items: (items as FaqsDoc['items']).map((item) => ({
                  ...item,
                  id: item.id || crypto.randomUUID(),
                  category: item.category || faqs.categories[0] || '',
                  showOnHome: Boolean(item.showOnHome),
                  showOnServices: Boolean(item.showOnServices),
                })),
              })
            }
            errors={doc.errors}
            path="items"
          />
        </Panel>
      </div>
      <DocumentActions doc={doc} props={props} />
      <HistoryPanel doc={doc} revisions={props.revisions} />
    </EditorOptionsProvider>
  )
}
