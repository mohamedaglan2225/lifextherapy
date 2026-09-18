import { BookingLink } from '@/components/ui/BookingLink'

/** Persistent booking action for small screens. */
export function MobileBookingCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ivory px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <BookingLink size="bar">Book a Session</BookingLink>
    </div>
  )
}
