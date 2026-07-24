import type { MetadataRoute } from 'next';

// Locale-agnostic by design — a PWA manifest is one file for the whole
// site (there's no per-locale manifest convention), so this lives outside
// app/[locale]/. start_url "/" lets middleware.ts pick the right locale on
// first launch same as any other cold visit.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'flowbot — BTC quant signals',
    short_name: 'flowbot',
    description: 'Live V7 signal engine + cancel-flow order-book research, straight off the real trading system.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050507',
    theme_color: '#050507',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
