import { siteConfig } from '@/config/site'
import { ButtonLink, type ButtonSize, type ButtonVariant } from './ButtonLink'
import type { ReactNode } from 'react'

type BookingLinkProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  /** Describes the selected service/session for assistive technology. */
  label?: string
  onClick?: () => void
}

/**
 * Single entry point for every booking action. Booking and payment happen
 * externally in Vagaro, so the destination always comes from site config.
 */
export function BookingLink({ children, label, ...props }: BookingLinkProps) {
  return (
    <ButtonLink href={siteConfig.bookingUrl} aria-label={label} {...props}>
      {children}
    </ButtonLink>
  )
}
