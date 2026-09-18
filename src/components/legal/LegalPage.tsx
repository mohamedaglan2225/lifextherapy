import type { ReactNode } from 'react'
import { routes } from '@/config/site'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Shared shell for the legal pages. The body is intentionally a marked
 * placeholder — no policy wording has been supplied.
 */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: ReactNode
}) {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={title}
        intro={intro}
        breadcrumbs={[{ label: 'Home', href: routes.home }, { label: title }]}
      />
      <section className="bg-ivory pb-24 lg:pb-32">
        <Container>
          <Reveal className="max-w-2xl rounded-sm border border-border bg-offwhite p-8 lg:p-10">
            <div className="flex flex-col gap-4 text-base font-light leading-relaxed text-bronze-dark">
              {children}
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
