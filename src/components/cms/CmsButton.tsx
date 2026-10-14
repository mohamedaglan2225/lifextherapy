import type { ButtonValue } from '@/lib/cms/fields'
import { BookingLink } from '@/components/ui/BookingLink'
import { ButtonLink, type ButtonSize, type ButtonVariant } from '@/components/ui/ButtonLink'

/** An editable button: either the Vagaro booking page or a link. Renders nothing without text. */
export function CmsButton({
  button,
  variant,
  size,
  className,
}: {
  button: ButtonValue
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}) {
  if (!button.label) return null
  if (button.action === 'booking') {
    return (
      <BookingLink variant={variant} size={size} className={className}>
        {button.label}
      </BookingLink>
    )
  }
  return (
    <ButtonLink href={button.href} variant={variant} size={size} className={className}>
      {button.label}
    </ButtonLink>
  )
}
