import type { ReactNode } from 'react'
import { getContact } from '@/lib/cms/published'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileBookingCTA } from './MobileBookingCTA'
import { PageTransition } from './PageTransition'

/** Header, footer and booking bar shared by every public page and the 404 page. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const contact = await getContact()

  return (
    <div className="pb-16 md:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-charcoal focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
      >
        Skip to content
      </a>
      <Header />
      <PageTransition>
        <main id="main">{children}</main>
      </PageTransition>
      <Footer contact={contact} />
      <MobileBookingCTA />
    </div>
  )
}
