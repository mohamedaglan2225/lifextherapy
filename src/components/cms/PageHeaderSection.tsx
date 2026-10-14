import type { ButtonValue } from '@/lib/cms/fields'
import { routes } from '@/config/site'
import { PageHeader } from '@/components/ui/PageHeader'
import { CmsButton } from './CmsButton'
import { Display } from './Display'

export type PageHeaderData = {
  eyebrow: string
  title: string
  intro: string
  breadcrumb: string
  actions: Array<{ button: ButtonValue }>
}

export function PageHeaderSection({ data }: { data: PageHeaderData }) {
  const actions = data.actions.filter((action) => action.button.label)
  return (
    <PageHeader
      eyebrow={data.eyebrow || undefined}
      title={<Display text={data.title} />}
      intro={data.intro || undefined}
      breadcrumbs={[{ label: 'Home', href: routes.home }, { label: data.breadcrumb }]}
      actions={
        actions.length > 0 ? (
          <>
            {actions.map((action, index) => (
              <CmsButton key={index} button={action.button} variant={index === 0 ? 'primary' : 'outlineDark'} />
            ))}
          </>
        ) : undefined
      }
    />
  )
}
