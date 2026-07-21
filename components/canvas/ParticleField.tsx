'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import type * as THREE from 'three';

// Ambient depth behind the candles — the flat black backdrop read as too
// dead/static on its own. Two Sparkles layers at different depths/speeds
// (near cyan, far violet) give the scene parallax and a slow "drifting
// dust" motion instead of a hard-edged empty void.
export function ParticleField({
  scrollProgress = 0,
  density = 1,
}: {
  scrollProgress?: number;
  density?: number;
}) {
  const near = useRef<THREE.Points>(null);
  const far = useRef<THREE.Points>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (near.current) {
      near.current.rotation.z = Math.sin(t * 0.05) * 0.05;
      near.current.position.y = Math.sin(t * 0.08) * 0.1 - scrollProgress * 0.6;
    }
    if (far.current) {
      far.current.rotation.z = -Math.cos(t * 0.03) * 0.04;
      far.current.position.y = Math.cos(t * 0.06) * 0.15 - scrollProgress * 1.0;
    }
  });

  return (
    <>
      <Sparkles
        ref={near}
        count={Math.round(140 * density)}
        scale={[9, 5, 4]}
        size={2.2}
        speed={0.35}
        opacity={0.55}
        color="#7ef9ff"
        position={[0, 0, -1.5]}
      />
      <Sparkles
        ref={far}
        count={Math.round(100 * density)}
        scale={[13, 7, 5]}
        size={1.4}
        speed={0.15}
        opacity={0.35}
        color="#b98bff"
        position={[0, 0, -4]}
      />
    </>
  );
}
