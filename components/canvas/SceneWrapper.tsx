'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { CanvasLoader } from './CanvasLoader';

// Three.js touches WebGL/window at import time — it can never run during
// SSR. ssr:false keeps it out of the server bundle entirely instead of
// just deferring it, which is what actually shrinks first-load JS.
const Scene = dynamic(() => import('./Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => <CanvasLoader />,
});

export function SceneWrapper({
  scrollProgress,
  signalBias = 0,
}: {
  scrollProgress: number;
  signalBias?: number;
}) {
  return (
    <div className="canvas-layer">
      <Suspense fallback={<CanvasLoader />}>
        <Scene scrollProgress={scrollProgress} signalBias={signalBias} />
      </Suspense>
    </div>
  );
}
