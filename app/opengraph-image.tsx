import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'KerayeGo — Car Rental & Intercity Ride Sharing in Pakistan';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Site-wide default social preview image. Any route that sets its own
// `openGraph.images` (vehicle/provider/trip detail pages) overrides this;
// everything else — home, listing pages, city pages — falls back to it.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background: '#1A0F14',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              width: 14,
              height: 64,
              borderRadius: 8,
              background: 'linear-gradient(180deg, #FF4E64 0%, #FF9E45 100%)',
            }}
          />
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            KerayeGo
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 34,
            color: 'rgba(255,255,255,0.72)',
            maxWidth: 880,
          }}
        >
          Car Rental &amp; Intercity Ride Sharing in Pakistan
        </div>
      </div>
    ),
    { ...size },
  );
}
