import { ImageResponse } from 'next/og';

// English-only by design: the OG renderer ships no CJK font, and loading a
// Noto TC subset here costs more than a bilingual card is worth. Brand mark
// + thesis reads fine for both locales.
export const runtime = 'edge';
export const alt = 'flowbot — a BTC system that watches itself';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: '#050507',
          backgroundImage:
            'radial-gradient(900px 500px at 18% 0%, rgba(126,249,255,0.12), transparent 60%), radial-gradient(800px 520px at 92% 100%, rgba(185,139,255,0.12), transparent 60%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 44 }}>
            <div style={{ width: 13, height: 30, background: '#00ffa3', borderRadius: 3 }} />
            <div style={{ width: 13, height: 44, background: '#ff3860', borderRadius: 3 }} />
          </div>
          <div style={{ color: '#e8e8ef', fontSize: 42, fontWeight: 700, letterSpacing: -1 }}>
            flowbot
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              color: '#e8e8ef',
              fontSize: 78,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            A BTC system that watches itself.
          </div>
          <div style={{ color: 'rgba(232,232,239,0.62)', fontSize: 30 }}>
            Dual-model signal engine · staged risk · live on OKX
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              color: 'rgba(126,249,255,0.85)',
              fontSize: 21,
              letterSpacing: 5,
              textTransform: 'uppercase',
            }}
          >
            Built in the open
          </div>
          <div style={{ color: 'rgba(232,232,239,0.45)', fontSize: 21 }}>
            Not investment advice
          </div>
        </div>
      </div>
    ),
    size,
  );
}
