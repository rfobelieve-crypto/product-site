import type { Metadata } from 'next';
import { Nav } from '@/components/sections/Nav';
import { Architecture } from '@/components/sections/Architecture';
import { SystemDetail } from '@/components/sections/SystemDetail';
import { Footer } from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'System — flowbot',
  description:
    'Data pipeline, dual-model signal engine, walk-forward validation, and the risk framework — how it actually works.',
};

// No 3D canvas here — same reasoning as /track-record: this is a reading
// page, not the cinematic hero.
export default function SystemPage() {
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pt-24">
        <Architecture />
        <SystemDetail />
      </main>
      <Footer />
    </div>
  );
}
