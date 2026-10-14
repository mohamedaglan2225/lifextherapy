import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'

/** Body of a legal page. Paragraphs starting with "## " are shown as subheadings. */
export function LegalBody({ data }: { data: { paragraphs: string[] } }) {
  return (
    <section className="bg-ivory pb-24 lg:pb-32">
      <Container>
        <Reveal className="max-w-2xl rounded-sm border border-border bg-offwhite p-8 lg:p-10">
          <div className="flex flex-col gap-4 text-base font-light leading-relaxed text-bronze-dark">
            {data.paragraphs.map((paragraph, index) =>
              paragraph.startsWith('## ') ? (
                <h2 key={index} className="mt-4 font-serif text-2xl leading-tight text-charcoal first:mt-0">
                  {paragraph.slice(3)}
                </h2>
              ) : (
                <p key={index} className={paragraph.includes('\n') ? 'whitespace-pre-line' : undefined}>
                  {paragraph}
                </p>
              ),
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
