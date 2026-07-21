'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// A drifting field of 3D candlesticks — replaces the earlier abstract
// "galaxy" hero object with something that reads as *this system's*
// visual: real OHLC bars, always moving, never static.
//
// Perf note: 4 InstancedMesh draw calls total (up/down × body/wick), not
// N separate meshes — cheap enough to run at 60fps on mobile GPUs even at
// COUNT=48. Up/down are split into separate meshes with a flat
// material.color each, rather than one mesh with per-instance
// vertexColors — instanceColor didn't reliably read in this stack, flat
// material.color always does.

const COUNT = 48;
const SPACING = 0.34;
const DRIFT_SPEED = 0.09; // world units / second, right → left
const HIDDEN_SCALE = 0.0001; // effectively invisible without branching in the shader

// Classic terminal red/green — punchy enough to survive Bloom's
// luminance threshold instead of washing out to grey.
const UP_COLOR = '#00ffa3';
const DOWN_COLOR = '#ff3860';

type Candle = { open: number; high: number; low: number; close: number; x: number };

function nextCandle(prevClose: number, x: number): Candle {
  // Mean-reverting random walk — visually reads as "real" price action
  // instead of pure noise (which looks jittery) or a straight trend
  // (which looks fake).
  const drift = (Math.random() - 0.5) * 0.9 - (prevClose - 0) * 0.08;
  const close = THREE.MathUtils.clamp(prevClose + drift, -3, 3);
  const open = prevClose;
  const wickUp = Math.random() * 0.5;
  const wickDown = Math.random() * 0.5;
  const high = Math.max(open, close) + wickUp;
  const low = Math.min(open, close) - wickDown;
  return { open, high, low, close, x };
}

/**
 * bias: -1..1, nudges the random walk down/up (fed by live signal
 * direction × confidence once wired — see HomeExperience). 0 = neutral.
 */
export function CandleField({
  scrollProgress = 0,
  bias = 0,
}: {
  scrollProgress?: number;
  bias?: number;
}) {
  const bodiesUp = useRef<THREE.InstancedMesh>(null);
  const wicksUp = useRef<THREE.InstancedMesh>(null);
  const bodiesDown = useRef<THREE.InstancedMesh>(null);
  const wicksDown = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const biasRef = useRef(bias);
  biasRef.current = bias;

  const candles = useMemo<Candle[]>(() => {
    const arr: Candle[] = [];
    let prev = 0;
    for (let i = 0; i < COUNT; i++) {
      const c = nextCandle(prev, (i - COUNT / 2) * SPACING);
      arr.push(c);
      prev = c.close;
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const hidden = useMemo(() => {
    const o = new THREE.Object3D();
    o.scale.setScalar(HIDDEN_SCALE);
    o.updateMatrix();
    return o.matrix;
  }, []);

  const applyCandle = (i: number, c: Candle) => {
    const up = c.close >= c.open;

    const bodyH = Math.max(Math.abs(c.close - c.open), 0.03);
    const bodyY = (c.open + c.close) / 2;
    dummy.position.set(c.x, bodyY, 0);
    dummy.scale.set(0.26, bodyH, 0.26);
    dummy.updateMatrix();
    (up ? bodiesUp : bodiesDown).current?.setMatrixAt(i, dummy.matrix);
    (up ? bodiesDown : bodiesUp).current?.setMatrixAt(i, hidden);

    const wickH = Math.max(c.high - c.low, 0.03);
    const wickY = (c.high + c.low) / 2;
    dummy.position.set(c.x, wickY, 0);
    dummy.scale.set(0.045, wickH, 0.045);
    dummy.updateMatrix();
    (up ? wicksUp : wicksDown).current?.setMatrixAt(i, dummy.matrix);
    (up ? wicksDown : wicksUp).current?.setMatrixAt(i, hidden);
  };

  // No mount-time seeding here on purpose: instancedMesh refs are null
  // until after commit, so setMatrixAt would no-op if called during
  // render. The useFrame loop below calls applyCandle for every candle on
  // every tick regardless of respawn, which covers frame 1 too.

  const leftBound = -((COUNT / 2) * SPACING) - SPACING;
  const rightBound = (COUNT / 2) * SPACING;

  useFrame((state, delta) => {
    if (group.current) {
      // Gentle parallax tilt + scroll-driven retreat, matching the
      // FloatingObject it replaced.
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
      group.current.position.y = -scrollProgress * 1.1;
      group.current.position.z = -scrollProgress * 1.6;
      const scale = 1 - scrollProgress * 0.2;
      group.current.scale.setScalar(scale);
    }

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      c.x -= DRIFT_SPEED * delta;
      if (c.x < leftBound) {
        const lastIdx = (i - 1 + candles.length) % candles.length;
        const prevClose = candles[lastIdx].close;
        const respawned = nextCandle(prevClose + biasRef.current * 0.25, rightBound);
        Object.assign(c, respawned);
      }
      applyCandle(i, c);
    }
    for (const ref of [bodiesUp, wicksUp, bodiesDown, wicksDown]) {
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {/* frustumCulled off: InstancedMesh's default bounding volume is just
          the un-instanced geometry's, which would incorrectly cull the
          whole batch since instances are scattered far outside it. */}
      <instancedMesh ref={bodiesUp} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={UP_COLOR} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={wicksUp} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={UP_COLOR} toneMapped={false} transparent opacity={0.85} />
      </instancedMesh>
      <instancedMesh ref={bodiesDown} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={DOWN_COLOR} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={wicksDown} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={DOWN_COLOR} toneMapped={false} transparent opacity={0.85} />
      </instancedMesh>
    </group>
  );
}
