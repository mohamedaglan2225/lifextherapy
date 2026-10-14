import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, Manrope } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/config/site'

const serif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-dm-serif-display',
  display: 'swap',
})

const sans = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: '/',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
}

export const viewport: Viewport = {
  themeColor: '#FAF6F1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        {/* Scroll reveals start hidden and are shown by script; without JS they must never stay invisible. */}
        <noscript>
          <style>{`[data-reveal],[data-stagger]>*,[data-settle]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen bg-ivory antialiased">{children}</body>
    </html>
  )
}
