const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudfront.net' },
    ],
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Baseline security headers — Vercel does not add these for you.
  // Full CSP is deliberately not attempted here (Next inline runtime +
  // three.js make a strict CSP its own project); these cover the
  // high-value, zero-breakage set.
  async headers() {
    const base = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];
    return [
      // 2026-09-30: charts are now same-origin static pages under
      // /archive/, embedded by our own chart pages via <iframe>. DENY would
      // block those too, so /archive/ gets SAMEORIGIN and everything else
      // keeps DENY. The two sources must not overlap, or both
      // X-Frame-Options values are sent and browsers treat that as DENY.
      {
        source: '/archive/:path*',
        headers: [...base, { key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      },
      {
        source: '/((?!archive/).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
