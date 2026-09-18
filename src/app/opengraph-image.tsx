import { ImageResponse } from 'next/og'
import { siteConfig } from '@/config/site'

export const alt = siteConfig.title
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
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
          {siteConfig.tagline}
        </div>
        <div style={{ fontSize: 86, lineHeight: 1.1 }}>{siteConfig.name}</div>
        <div style={{ fontSize: 32, lineHeight: 1.4, color: '#DED4CA', marginTop: 32, maxWidth: 820 }}>
          {siteConfig.description}
        </div>
      </div>
    ),
    size,
  )
}
