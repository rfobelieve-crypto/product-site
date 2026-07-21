/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudfront.net' },
    ],
  },
  // three.js / drei / fiber ship ESM — transpile so webpack processes them
  // through the same loader pipeline as app code instead of treating them
  // as opaque pre-built externals.
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

module.exports = nextConfig;
