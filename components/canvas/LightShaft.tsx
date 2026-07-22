'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// A cheap, self-contained fake volumetric light shaft — the reference
// look (soft spotlight beam + haze over the candles) needs a visible
// light column, not just point lights. A real ray-marched volumetric
// shader is expensive and fragile; this fakes it with two
// additive-blended planes crossed at an angle. The texture is a radial
// gradient (soft in every direction, no straight edge anywhere) drawn on
// a canvas at mount time — stretching it onto a tall, narrow plane
// elongates the circular falloff into a shaft shape. A polygon-shaped
// alpha mask was tried first and produced a hard diagonal edge where the
// shape's silhouette met the transparent background; a radial gradient
// has no silhouette to show. No external texture/HDR asset either way —
// see CLAUDE.md 2026-07-21, a remote HDR fetch stalled first paint once
// already.
function useShaftTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const grad = ctx.createRadialGradient(
      canvas.width / 2,
      0,
      0,
      canvas.width / 2,
      0,
      canvas.width * 0.85,
    );
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

export function LightShaft({ color = '#7ef9ff' }: { color?: string }) {
  const texture = useShaftTexture();
  const matA = useRef<THREE.MeshBasicMaterial>(null);
  const matB = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.13 + Math.sin(t * 0.35) * 0.03;
    if (matA.current) matA.current.opacity = pulse;
    if (matB.current) matB.current.opacity = pulse * 0.55;
  });

  if (!texture) return null;

  return (
    <group position={[0.6, 4.6, -3.5]}>
      <mesh rotation={[0, 0.32, 0.05]}>
        <planeGeometry args={[2.6, 8]} />
        <meshBasicMaterial
          ref={matA}
          map={texture}
          color={color}
          transparent
          opacity={0.13}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[0, -0.28, -0.04]}>
        <planeGeometry args={[2.6, 8]} />
        <meshBasicMaterial
          ref={matB}
          map={texture}
          color={color}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
