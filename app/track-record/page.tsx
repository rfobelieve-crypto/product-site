import type { Metadata } from 'next';
import { Nav } from '@/components/sections/Nav';
import { TrackRecord } from '@/components/sections/TrackRecord';
import { Footer } from '@/components/sections/Footer';
import { getTrackRecord } from '@/lib/trackRecord';

export const metadata: Metadata = {
  title: 'Track record — flowbot',
  description:
    'Live signal and trade win rates with Wilson confidence intervals, and max drawdown from compounded closed-trade returns.',
};

// No 3D canvas on this route — it's a data page, not the cinematic hero;
// carrying the WebGL bundle here would be pure cost with no payoff.
export default async function TrackRecordPage() {
  const data = await getTrackRecord();
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pt-32">
        <TrackRecord data={data} />
      </main>
      <Footer />
    </div>
  );
}
