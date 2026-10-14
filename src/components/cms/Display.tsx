import { Fragment } from 'react'

/**
 * Renders an editable heading: line breaks become <br />, `*words*` become
 * <em>. Text is always rendered as text, never as HTML.
 */
export function Display({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {line.split(/\*([^*]+)\*/).map((part, partIndex) =>
            partIndex % 2 === 1 ? <em key={partIndex}>{part}</em> : part ? <Fragment key={partIndex}>{part}</Fragment> : null,
          )}
        </Fragment>
      ))}
    </>
  )
}

/** Plain-text version of a display heading, for aria labels and metadata. */
export function displayText(text: string) {
  return text.replace(/\*([^*]+)\*/g, '$1').replace(/\n/g, ' ')
}
