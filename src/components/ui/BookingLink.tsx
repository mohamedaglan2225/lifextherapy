import { getVagaroBookingUrl } from '@/config/vagaro'
import { ButtonLink, type ButtonSize, type ButtonVariant } from './ButtonLink'
import type { ReactNode } from 'react'

type BookingLinkProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  /** Describes the selected service/session for assistive technology. */
  label?: string
  /** Service slug; with `minutes`, links straight to that Vagaro service when one is configured. */
  service?: string
  minutes?: number
  onClick?: () => void
}

/**
 * Single entry point for every booking action. Booking and payment happen
 * externally in Vagaro, so the destination always comes from the Vagaro config.
 */
export function BookingLink({ children, label, service, minutes, ...props }: BookingLinkProps) {
  return (
    <ButtonLink href={getVagaroBookingUrl(service, minutes)} aria-label={label} {...props}>
      {children}
    </ButtonLink>
  )
}
