'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Service } from '@/data/services'
import { formatPrice } from '@/data/services'
import { routes } from '@/config/site'
import { BookingLink } from '@/components/ui/BookingLink'
import { SessionOption } from './SessionOption'

type ServiceCardProps = {
  service: Service
  /** Above-the-fold cards can opt into eager loading. */
  priority?: boolean
  sizes?: string
}

export function ServiceCard({
  service,
  priority = false,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
}: ServiceCardProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = service.sessions[selectedIndex]
  const href = routes.service(service.slug)

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-border bg-offwhite transition-premium duration-[var(--lx-normal)] hover:border-bronze hover:shadow-[0_20px_44px_-28px_rgba(29,27,25,0.45)] motion-safe:hover:-translate-y-1">
      {/* Duplicate of the title link, hidden from assistive tech to avoid a repeated announcement. */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block h-48 overflow-hidden bg-ivory-dark"
      >
        <Image
          src={service.image}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-premium duration-500 motion-safe:group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 font-serif text-xl text-charcoal">
          <Link
            href={href}
            className="transition-premium duration-[var(--lx-fast)] hover:text-bronze"
          >
            {service.name}
          </Link>
        </h3>
        <p className="mb-5 flex-1 text-sm font-light leading-relaxed text-bronze-dark">
          {service.description}
        </p>

        <fieldset className="mb-5">
          <legend className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-bronze">
            Session Length
          </legend>
          <div className="flex flex-wrap gap-2">
            {service.sessions.map((session, index) => (
              <SessionOption
                key={session.minutes}
                name={`${service.slug}-session`}
                session={session}
                checked={index === selectedIndex}
                onSelect={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        </fieldset>

        <p
          aria-live="polite"
          className="mb-4 flex items-center justify-between border-t border-border py-3"
        >
          <span className="text-xs font-light text-bronze-dark">{selected.minutes} min session</span>
          <span className="text-base font-semibold text-charcoal">{formatPrice(selected.price)}</span>
        </p>

        <BookingLink
          variant="dark"
          size="block"
          service={service.slug}
          minutes={selected.minutes}
          label={`Book ${service.name}, ${selected.minutes} minute session, ${formatPrice(selected.price)} — continues to Vagaro`}
        >
          Book {service.shortName}
        </BookingLink>

        <Link
          href={href}
          className="group/more mt-3 inline-flex items-center justify-center gap-2 py-2 text-xs font-medium tracking-wide text-bronze transition-premium duration-[var(--lx-fast)] hover:text-bronze-dark"
        >
          Learn More
          <span className="sr-only"> about {service.name}</span>
          <span
            aria-hidden="true"
            className="h-px w-5 origin-left bg-current transition-premium duration-[var(--lx-normal)] group-hover/more:translate-x-1 group-hover/more:scale-x-150"
          />
        </Link>
      </div>
    </article>
  )
}
