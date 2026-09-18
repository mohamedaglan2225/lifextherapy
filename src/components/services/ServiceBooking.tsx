'use client'

import { useState } from 'react'
import type { Service } from '@/data/services'
import { formatPrice } from '@/data/services'
import { BookingLink } from '@/components/ui/BookingLink'
import { SessionOption } from './SessionOption'

/**
 * Session picker plus the booking action for a single service. Booking itself
 * still continues to Vagaro through the shared BookingLink.
 */
export function ServiceBooking({ service }: { service: Service }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = service.sessions[selectedIndex]

  return (
    <div className="rounded-sm border border-border bg-offwhite p-6 lg:p-8">
      <fieldset>
        <legend className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-bronze">
          Choose Your Session Length
        </legend>
        <div className="flex flex-wrap gap-2">
          {service.sessions.map((session, index) => (
            <SessionOption
              key={session.minutes}
              name={`${service.slug}-detail-session`}
              session={session}
              checked={index === selectedIndex}
              onSelect={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </fieldset>

      <p
        aria-live="polite"
        className="mt-6 flex items-baseline justify-between border-t border-border pt-5"
      >
        <span className="text-sm font-light text-bronze-dark">
          {service.name} &middot; {selected.minutes} min
        </span>
        <span className="font-serif text-2xl text-charcoal">{formatPrice(selected.price)}</span>
      </p>

      <BookingLink
        size="bar"
        className="mt-6"
        label={`Book ${service.name}, ${selected.minutes} minute session, ${formatPrice(selected.price)} — continues to Vagaro`}
      >
        Book This Session
      </BookingLink>

      <p className="mt-4 text-center text-xs font-light text-bronze-dark">
        Booking and payment are completed through Vagaro.
      </p>
    </div>
  )
}
