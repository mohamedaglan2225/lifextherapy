import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, Manrope } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/config/site'
import { siteMetadata } from '@/lib/cms/metadata'
import { getSettings } from '@/lib/cms/published'

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

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata(await getSettings(), siteConfig.url)
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
