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
      <CandleField scrollProgress={scrollProgress} bias={signalBias} isMobile={isMobile} />
      {/* Cheap on both tiers — two additive-blended planes, no full-screen
          pass — unlike Bloom/DepthOfField below. boost compensates for
          mobile having no Bloom pass to turn the additive opacity into a
          visible glow. */}
      <LightShaft boost={isMobile} />
      {/* Env map drives the candles' clearcoat highlight — without it,
          clearcoat/metalness have nothing to reflect and the mobile
          material (no transmission, so it leans on clearcoat for all its
          shine) renders flat/matte regardless of light intensity. Built
          from in-scene Lightformers instead of an HDR `preset` —
          preset/`files` fetch a texture from a remote CDN, which on first
          paint of a marketing hero left the candle field blank behind a
          stuck loader for 10+ seconds (worse, hangs forever if that CDN
          is unreachable). Lightformers render a small local cubemap with
          zero network dependency — a one-time capture, not a per-frame
          cost, so unlike Bloom/DepthOfField below it's cheap enough to
          keep on for mobile too (lower resolution there). */}
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
      {/* Bloom + DepthOfField off entirely on mobile — postprocessing is a
          full extra render pass each, not just a quality knob, and the
          phone GPUs this genre of site tends to run on can't eat them for
          free. DepthOfField's world-focus is set to the candle plane
          (camera sits at z=6.5, candles render at z=0) so the candles
          stay legible while the particle layers — spread from z=-1.5 to
          z=-4.5 — fall outside the focus range and blur into soft bokeh
          circles, matching the reference look's hazy floating orbs.
          Bloom's threshold/intensity nudged up from the original tuning
          for the extra glow that look wants. */}
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
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.42}
            luminanceSmoothing={0.22}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
