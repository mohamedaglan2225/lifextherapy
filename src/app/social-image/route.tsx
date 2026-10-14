import { ImageResponse } from 'next/og'
import { getSettings } from '@/lib/cms/published'

const size = { width: 1200, height: 630 }

/** Default share image, generated from the site name, tagline and description in Settings. */
export const dynamic = 'force-static'

export async function GET() {
  const settings = await getSettings()
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#1D1B19',
          color: '#FFFDFC',
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#9A7955',
            marginBottom: 32,
          }}
        >
          {settings.tagline}
        </div>
        <div style={{ fontSize: 86, lineHeight: 1.1 }}>{settings.siteName}</div>
        <div style={{ fontSize: 32, lineHeight: 1.4, color: '#DED4CA', marginTop: 32, maxWidth: 820 }}>
          {settings.seo.description}
        </div>
      </div>
    ),
    size,
  )
}
