'use client';

import { useRef } from 'react';
import { useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { SceneWrapper } from './canvas/SceneWrapper';
import { useScrollProgress } from '@/lib/hooks/useScrollProgress';
import type { SignalFeed } from '@/lib/signalFeed';
import type { TrackRecord as TrackRecordData } from '@/lib/trackRecord';
import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { Story } from './sections/Story';
import { Architecture } from './sections/Architecture';
import { Stats } from './sections/Stats';
import { TrackRecord } from './sections/TrackRecord';
import { EngineeringLog } from './sections/EngineeringLog';
import { LiveSignal } from './sections/LiveSignal';
import { Footer } from './sections/Footer';

// UP/DOWN + confidence → -1..1 lean for the candle field's random walk
// (see CandleField's `bias` prop). Confidence is 0-100; a NEUTRAL or
// missing feed contributes no lean at all rather than guessing.
function signalToBias(feed: SignalFeed | null): number {
  if (!feed?.direction || feed.direction === 'NEUTRAL') return 0;
  const magnitude = feed.confidence != null ? feed.confidence / 100 : 0.5;
  return feed.direction === 'UP' ? magnitude : -magnitude;
}

export function HomeExperience({
  feed,
  trackRecord,
}: {
  feed: SignalFeed | null;
  trackRecord: TrackRecordData | null;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress(pageRef);

  // useFrame in the 3D layer wants a plain number each frame, not a
  // MotionValue subscription — mirror it into local state once per change.
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollProgress, 'change', (v) => setProgress(v));

  return (
    <div id="top" ref={pageRef} className="relative">
      <Nav />
      <SceneWrapper scrollProgress={progress} signalBias={signalToBias(feed)} />
      <div className="content-layer">
        <Hero />
        <Story />
        <Architecture />
        <Stats />
        <TrackRecord data={trackRecord} />
        <EngineeringLog />
        <div id="live-signal" className="mx-auto max-w-md px-6 pb-32 sm:px-16">
          <LiveSignal feed={feed} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
