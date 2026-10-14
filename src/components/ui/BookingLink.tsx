'use client'

import type { ReactNode } from 'react'
import { useBookingUrl } from '@/components/cms/BookingUrl'
import { ButtonLink, type ButtonSize, type ButtonVariant } from './ButtonLink'

type BookingLinkProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  /** Describes the selected service/session for assistive technology. */
  label?: string
  /** A specific Vagaro link (a service session); defaults to the main booking page. */
  href?: string
  onClick?: () => void
}

/**
 * Single entry point for every booking action. Booking and payment happen
 * externally in Vagaro; the destination is either a session's own Vagaro link
 * or the main booking page from Settings.
 */
export function BookingLink({ children, label, href, ...props }: BookingLinkProps) {
  const businessUrl = useBookingUrl()
  return (
    <ButtonLink href={href || businessUrl} aria-label={label} {...props}>
      {children}
    </ButtonLink>
  )
}
