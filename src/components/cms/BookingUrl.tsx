'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { defaultContent } from '@/lib/cms/defaults'

const BookingUrlContext = createContext(defaultContent.settings.booking.businessUrl)

/** Provides the main Vagaro booking page (from Settings) to every booking button. */
export function BookingUrlProvider({ url, children }: { url: string; children: ReactNode }) {
  return <BookingUrlContext.Provider value={url}>{children}</BookingUrlContext.Provider>
}

export function useBookingUrl() {
  return useContext(BookingUrlContext)
}
