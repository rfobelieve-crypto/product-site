'use client';

import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useEffect, useState } from 'react';
import { CandleField } from './CandleField';
import { ParticleField } from './ParticleField';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

export function Scene({
  scrollProgress,
  signalBias = 0,
}: {
  scrollProgress: number;
  signalBias?: number;
}) {
  const isMobile = useIsMobile();

  return (
    <Canvas
      camera={{ position: [0, 0.4, 6.5], fov: 38 }}
      // Cap DPR on phones — a full-retina WebGL canvas behind scrolling
      // text is the single most common mobile jank source in this genre
      // of site.
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 2, 4]} intensity={1.0} color="#7ef9ff" />
      <pointLight position={[-3, -2, -2]} intensity={0.7} color="#b98bff" />
      <ParticleField scrollProgress={scrollProgress} density={isMobile ? 0.5 : 1} />
      <CandleField scrollProgress={scrollProgress} bias={signalBias} />
      {/* Bloom off entirely on mobile — postprocessing is a full extra
          render pass, not just a quality knob, and the phone GPUs this
          genre of site tends to run on can't eat it for free. */}
      {!isMobile && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.55}
            luminanceThreshold={0.45}
            luminanceSmoothing={0.2}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
