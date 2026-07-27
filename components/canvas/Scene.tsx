'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Bloom, DepthOfField, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useState } from 'react';
import { CandleField } from './CandleField';
import { LightShaft } from './LightShaft';
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
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      {/* Exponential fog sells the echo rows' depth; its color equals the
          page background, so the alpha-clear canvas stays seamless. */}
      <fogExp2 attach="fog" args={['#050507', 0.06]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 2, 4]} intensity={1.0} color="#7ef9ff" />
      <pointLight position={[-3, -2, -2]} intensity={0.7} color="#b98bff" />
      <ParticleField scrollProgress={scrollProgress} density={isMobile ? 0.5 : 1} />
      <CandleField scrollProgress={scrollProgress} bias={signalBias} isMobile={isMobile} />
      <LightShaft boost={isMobile} />
      <Environment resolution={isMobile ? 128 : 256}>
        <Lightformer intensity={2} color="#7ef9ff" position={[3, 2, 4]} scale={[4, 4, 1]} />
        <Lightformer intensity={1.5} color="#b98bff" position={[-3, -2, -2]} scale={[4, 4, 1]} />
        <Lightformer
          intensity={0.6}
          color="#ffffff"
          position={[0, 5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[6, 6, 1]}
        />
      </Environment>
      {!isMobile && (
        <EffectComposer multisampling={0}>
          <DepthOfField
            worldFocusDistance={6.5}
            worldFocusRange={3}
            focalLength={0.05}
            bokehScale={3}
            resolutionScale={0.6}
            height={480}
          />
          {/* Neon-line tuning (方案 C): bloom is what turns the thin additive
              lines into glowing filaments. Dialled back 2026-07-27 (glow was
              too strong): intensity 1.0→0.55 and threshold 0.12→0.30, so only
              the brighter cores bloom instead of the whole field hazing over —
              lines stay lit, the halo stops washing out the headline. */}
          <Bloom
            intensity={0.55}
            luminanceThreshold={0.30}
            luminanceSmoothing={0.22}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
