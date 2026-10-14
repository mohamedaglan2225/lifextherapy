'use client'

import {
  BOOKING_FIELDS,
  CONTACT_FIELDS,
  DEFAULT_SEO_FIELDS,
  FOOTER_FIELDS,
  HOURS_FIELD,
  NAVIGATION_FIELD,
  SETTINGS_FIELDS,
  SOCIAL_FIELDS,
} from '@/lib/cms/documents'
import { DocumentActions, DocumentStatus, HistoryPanel, useDocument, type DocumentProps } from './DocumentEditor'
import { EditorOptionsProvider, FieldControl, FieldsForm, type EditorOptions } from './fields'
import { Panel } from './ui'

const groups: Array<{ name: string; title: string; description?: string; fields: typeof CONTACT_FIELDS }> = [
  { name: 'contact', title: 'Contact details', description: 'Shown on the Contact page and used by the Call and Email buttons.', fields: CONTACT_FIELDS },
  { name: 'social', title: 'Social links', description: 'Shown in the footer and on the Contact page.', fields: SOCIAL_FIELDS },
  { name: 'booking', title: 'Booking', description: 'Service pages use each session’s own Vagaro link when one is set.', fields: BOOKING_FIELDS },
  { name: 'footer', title: 'Footer', fields: FOOTER_FIELDS },
  { name: 'seo', title: 'Default search & sharing', fields: DEFAULT_SEO_FIELDS },
]

export function SettingsEditor({ props, options }: { props: DocumentProps; options: EditorOptions }) {
  const doc = useDocument(props)
  const data = doc.data

  return (
    <EditorOptionsProvider value={options}>
      <DocumentStatus doc={doc} props={props} />
      <div className="flex flex-col gap-6">
        <Panel title="Brand" description="The site name appears in page titles, the footer and the generated share image.">
          <FieldsForm fields={SETTINGS_FIELDS} value={data} onChange={(next) => doc.setData(next)} errors={doc.errors} path="" />
        </Panel>
        {groups.slice(0, 1).map((group) => (
          <Panel key={group.name} title={group.title} description={group.description}>
            <FieldsForm
              fields={group.fields}
              value={data[group.name] as Record<string, unknown>}
              onChange={(value) => doc.setData({ ...data, [group.name]: value })}
              errors={doc.errors}
              path={group.name}
            />
          </Panel>
        ))}
        <Panel title="Business hours">
          <FieldControl field={HOURS_FIELD} value={data.hours} onChange={(hours) => doc.setData({ ...data, hours })} errors={doc.errors} path="hours" />
        </Panel>
        <Panel title="Navigation" description="Links in the header, mobile menu and footer, in this order.">
          <FieldControl field={NAVIGATION_FIELD} value={data.navigation} onChange={(navigation) => doc.setData({ ...data, navigation })} errors={doc.errors} path="navigation" />
        </Panel>
        {groups.slice(1).map((group) => (
          <Panel key={group.name} title={group.title} description={group.description}>
            <FieldsForm
              fields={group.fields}
              value={data[group.name] as Record<string, unknown>}
              onChange={(value) => doc.setData({ ...data, [group.name]: value })}
              errors={doc.errors}
              path={group.name}
            />
          </Panel>
        ))}
      </div>
      <DocumentActions doc={doc} props={props} />
      <HistoryPanel doc={doc} revisions={props.revisions} />
    </EditorOptionsProvider>
  )
}
