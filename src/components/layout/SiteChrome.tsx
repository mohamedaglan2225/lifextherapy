import type { ReactNode } from 'react'
import { draftMode } from 'next/headers'
import { getSettings } from '@/lib/cms/published'
import { BookingUrlProvider } from '@/components/cms/BookingUrl'
import { PreviewBar } from '@/components/cms/PreviewBar'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileBookingCTA } from './MobileBookingCTA'
import { PageTransition } from './PageTransition'

/** Header, footer and booking bar shared by every public page and the 404 page. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [settings, { isEnabled: preview }] = await Promise.all([getSettings(), draftMode()])

  return (
    <BookingUrlProvider url={settings.booking.businessUrl}>
      <div className="pb-16 md:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-charcoal focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
        >
          Skip to content
        </a>
        <Header
          siteName={settings.siteName}
          logo={settings.logo}
          navigation={settings.navigation}
          bookLabel={settings.booking.headerLabel}
          menuBookLabel={settings.booking.menuLabel}
        />
        <PageTransition>
          <main id="main">{children}</main>
        </PageTransition>
        <Footer settings={settings} />
        <MobileBookingCTA label={settings.booking.mobileBarLabel} />
        {preview && <PreviewBar />}
      </div>
    </BookingUrlProvider>
  )
}
