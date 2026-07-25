'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { CanvasLoader } from './CanvasLoader';

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
  // prefers-reduced-motion: skip WebGL entirely — a static gradient keeps
  // the palette without a perpetually-animating particle field.
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (reduced) {
    return (
      <div
        className="canvas-layer"
        aria-hidden
        style={{
          background:
            'radial-gradient(60% 50% at 30% 20%, rgba(126,249,255,0.07), transparent 70%), radial-gradient(50% 45% at 75% 70%, rgba(185,139,255,0.07), transparent 70%)',
        }}
      />
    );
  }

  return (
    <div className="canvas-layer">
      <Suspense fallback={<CanvasLoader />}>
        <Scene scrollProgress={scrollProgress} signalBias={signalBias} />
      </Suspense>
    </div>
  );
}
