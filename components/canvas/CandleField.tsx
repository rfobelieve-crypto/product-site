'use client';

import { useEffect, useMemo, useRef } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';

extend({ RoundedBoxGeometry });

declare module '@react-three/fiber' {
  interface ThreeElements {
    roundedBoxGeometry: ThreeElements['boxGeometry'];
  }
}

// Redesign (方案 B「調和綠紅」, picked in candle-field-redesign.html):
// - Green/red kept, but desaturated one notch and lightness-matched to the
//   iris cyan/violet accents, so the field stops fighting the site palette.
// - No transmission pass anymore — the frosted look comes from clearcoat +
//   opacity + bloom. Cheaper on desktop AND mobile (one material config).
// - Three depth rows (main + two dim echoes) give the field parallax
//   instead of one flat marching line. Mobile renders the main row only.
// - Candles scale in/out over EDGE_FADE world units at both bounds — no
//   more hard pop-in on respawn.
const COUNT = 48;
const SPACING = 0.34;
const DRIFT_SPEED = 0.09;
const BODY_WIDTH = 0.17;
const BODY_CORNER_RADIUS = 0.06;
const WICK_WIDTH = 0.035;
const WICK_CORNER_RADIUS = 0.16;
const EDGE_FADE = 1.1;

// 2026-07-25: colours overridden to match the OG card's brand candlesticks
// (opengraph-image.tsx) per user request — brighter/more saturated than the
// original 方案B 調和綠紅. Vivid with the emissive + bloom pass; dial
// emissiveIntensity / opacity in makeMaterial down a notch if too loud.
const UP_COLOR = '#00ffa3';
const DOWN_COLOR = '#ff3860';

// z-depth, uniform scale, speed multiplier, opacity multiplier
const ROWS = [
  { z: 0, scale: 1, speed: 1, fade: 1 },
  { z: -1.8, scale: 0.72, speed: 0.6, fade: 0.4 },
  { z: -3.6, scale: 0.5, speed: 0.38, fade: 0.18 },
];

type Candle = { open: number; high: number; low: number; close: number; x: number };

function nextCandle(prevClose: number, x: number): Candle {
  const drift = (Math.random() - 0.5) * 0.9 - (prevClose - 0) * 0.08;
  const close = THREE.MathUtils.clamp(prevClose + drift, -3, 3);
  const open = prevClose;
  const wickUp = Math.random() * 0.5;
  const wickDown = Math.random() * 0.5;
  const high = Math.max(open, close) + wickUp;
  const low = Math.min(open, close) - wickDown;
  return { open, high, low, close, x };
}

function smoothstep(a: number, b: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function makeMaterial(color: string, fade: number, isWick: boolean) {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.3,
    roughness: isWick ? 0.1 : 0.14,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: isWick ? 0.08 : 0.12,
    envMapIntensity: 1.1,
    transparent: true,
    opacity: 0.8 * fade * (isWick ? 0.92 : 1),
    toneMapped: false,
  });
}

const LEFT_BOUND = -((COUNT / 2) * SPACING) - SPACING;
const RIGHT_BOUND = (COUNT / 2) * SPACING;

function CandleRow({
  biasRef,
  speed,
  fade,
}: {
  biasRef: React.MutableRefObject<number>;
  speed: number;
  fade: number;
}) {
  const bodiesUp = useRef<THREE.InstancedMesh>(null);
  const wicksUp = useRef<THREE.InstancedMesh>(null);
  const bodiesDown = useRef<THREE.InstancedMesh>(null);
  const wicksDown = useRef<THREE.InstancedMesh>(null);

  const materials = useMemo(
    () => ({
      bodyUp: makeMaterial(UP_COLOR, fade, false),
      wickUp: makeMaterial(UP_COLOR, fade, true),
      bodyDown: makeMaterial(DOWN_COLOR, fade, false),
      wickDown: makeMaterial(DOWN_COLOR, fade, true),
    }),
    [fade],
  );
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

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
    o.scale.setScalar(0.0001);
    o.updateMatrix();
    return o.matrix;
  }, []);

  const applyCandle = (i: number, c: Candle) => {
    const up = c.close >= c.open;
    // scale in at the right bound, out at the left — no pop-in
    const edge =
      smoothstep(LEFT_BOUND, LEFT_BOUND + EDGE_FADE, c.x) *
      (1 - smoothstep(RIGHT_BOUND - EDGE_FADE, RIGHT_BOUND, c.x));

    const bodyH = Math.max(Math.abs(c.close - c.open), 0.03) * edge;
    dummy.position.set(c.x, (c.open + c.close) / 2, 0);
    dummy.scale.set(BODY_WIDTH * edge || 0.0001, bodyH || 0.0001, BODY_WIDTH * edge || 0.0001);
    dummy.updateMatrix();
    (up ? bodiesUp : bodiesDown).current?.setMatrixAt(i, dummy.matrix);
    (up ? bodiesDown : bodiesUp).current?.setMatrixAt(i, hidden);

    const wickH = Math.max(c.high - c.low, 0.03) * edge;
    dummy.position.set(c.x, (c.high + c.low) / 2, 0);
    dummy.scale.set(WICK_WIDTH * edge || 0.0001, wickH || 0.0001, WICK_WIDTH * edge || 0.0001);
    dummy.updateMatrix();
    (up ? wicksUp : wicksDown).current?.setMatrixAt(i, dummy.matrix);
    (up ? wicksDown : wicksUp).current?.setMatrixAt(i, hidden);
  };

  useFrame((_, delta) => {
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      c.x -= DRIFT_SPEED * speed * delta;
      if (c.x < LEFT_BOUND) {
        const lastIdx = (i - 1 + candles.length) % candles.length;
        const prevClose = candles[lastIdx].close;
        Object.assign(c, nextCandle(prevClose + biasRef.current * 0.25, RIGHT_BOUND));
      }
      applyCandle(i, c);
    }
    for (const ref of [bodiesUp, wicksUp, bodiesDown, wicksDown]) {
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={bodiesUp} args={[undefined, undefined, COUNT]} frustumCulled={false} material={materials.bodyUp}>
        <roundedBoxGeometry args={[1, 1, 1, 4, BODY_CORNER_RADIUS]} />
      </instancedMesh>
      <instancedMesh ref={wicksUp} args={[undefined, undefined, COUNT]} frustumCulled={false} material={materials.wickUp}>
        <roundedBoxGeometry args={[1, 1, 1, 4, WICK_CORNER_RADIUS]} />
      </instancedMesh>
      <instancedMesh ref={bodiesDown} args={[undefined, undefined, COUNT]} frustumCulled={false} material={materials.bodyDown}>
        <roundedBoxGeometry args={[1, 1, 1, 4, BODY_CORNER_RADIUS]} />
      </instancedMesh>
      <instancedMesh ref={wicksDown} args={[undefined, undefined, COUNT]} frustumCulled={false} material={materials.wickDown}>
        <roundedBoxGeometry args={[1, 1, 1, 4, WICK_CORNER_RADIUS]} />
      </instancedMesh>
    </>
  );
}

export function CandleField({
  scrollProgress = 0,
  bias = 0,
  isMobile = false,
}: {
  scrollProgress?: number;
  bias?: number;
  isMobile?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const biasRef = useRef(bias);
  biasRef.current = bias;

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
      group.current.position.y = -scrollProgress * 1.1;
      group.current.position.z = -scrollProgress * 1.6;
      group.current.scale.setScalar(1 - scrollProgress * 0.2);
    }
  });

  // Echo rows are decorative depth, not extra "price series" claims —
  // and they're desktop-only (mobile keeps one row for perf).
  const rows = isMobile ? ROWS.slice(0, 1) : ROWS;

  return (
    <group ref={group}>
      {rows.map((cfg) => (
        <group key={cfg.z} position-z={cfg.z} scale={cfg.scale}>
          <CandleRow biasRef={biasRef} speed={cfg.speed} fade={cfg.fade} />
        </group>
      ))}
    </group>
  );
}
