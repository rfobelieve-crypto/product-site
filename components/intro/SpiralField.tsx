'use client';

import { useEffect, useRef, useState } from 'react';

// Session-intro visual: a spiral starfield that dollies the camera forward
// through it. Ported from a 21st.dev community bookmark
// (xubohuah/spiral-animation, credited to Bleuje) with three fixes:
//   1. The original built its star field twice — once inside a seeded-RNG
//      setup whose result was discarded, once again right after with the
//      real RNG — silently doubling NUMBER_OF_STARS for zero visible
//      benefit. The seeded-RNG dance added no determinism worth keeping
//      (it was overwritten before first paint), so it's dropped entirely.
//   2. The canvas was rasterized at a forced square resolution
//      (`size = max(width, height)`) then stretched via CSS into the
//      real, non-square viewport — squashing the spiral into an ellipse
//      on any widescreen display. Now sized to the actual viewport.
//   3. Per-star `dotSize`/`strokeWeightFactor`/`finalScale` were computed
//      every frame but only ever fed a `ctx.lineWidth` assignment that a
//      subsequent `ctx.fill()` (not `.stroke()`) never reads — dead work
//      on 5000 stars every frame. Dropped; the trail dots (which *do*
//      read their computed width via `arc(..., sw / 2, ...)`) are
//      untouched.
// Plain Canvas 2D + GSAP, not react-three-fiber — this is a second,
// independent context that fully unmounts once the intro is dismissed,
// not a layer inside the persistent hero Scene.

class Vector2D {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class Vector3D {
  constructor(
    public x: number,
    public y: number,
    public z: number,
  ) {}

  static random(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}

const NUMBER_OF_STARS = 5000;
const TRAIL_LENGTH = 80;
const CAMERA_Z = -400;
const CAMERA_TRAVEL_DISTANCE = 3400;
const START_DOT_Y_OFFSET = 28;
const VIEW_ZOOM = 100;
const CHANGE_EVENT_TIME = 0.32;
const LOOP_DURATION = 15;

function easeP(p: number, g: number): number {
  return p < 0.5 ? 0.5 * Math.pow(2 * p, g) : 1 - 0.5 * Math.pow(2 * (1 - p), g);
}

function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 4.5;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1;
}

function mapRange(v: number, s1: number, e1: number, s2: number, e2: number): number {
  return s2 + (e2 - s2) * ((v - s1) / (e1 - s1));
}

function constrain(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

function spiralPath(p: number): Vector2D {
  const pc = easeP(constrain(1.2 * p, 0, 1), 1.8);
  const turns = 6;
  const theta = 2 * Math.PI * turns * Math.sqrt(pc);
  const r = 170 * Math.sqrt(pc);
  return new Vector2D(r * Math.cos(theta), r * Math.sin(theta) + START_DOT_Y_OFFSET);
}

// Spins a point around its midpoint with the counterpart, elastic-eased —
// gives each trail dot a small orbiting wobble instead of sitting dead on
// the path.
function rotateAround(v1: Vector2D, v2: Vector2D, p: number, orientation: boolean): Vector2D {
  const middle = new Vector2D((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
  const dx = v1.x - middle.x;
  const dy = v1.y - middle.y;
  const angle = Math.atan2(dy, dx);
  const o = orientation ? -1 : 1;
  const r = Math.sqrt(dx * dx + dy * dy);
  const bounce = Math.sin(p * Math.PI) * 0.05 * (1 - p);
  const spin = angle + o * Math.PI * easeOutElastic(p);
  return new Vector2D(
    middle.x + r * (1 + bounce) * Math.cos(spin),
    middle.y + r * (1 + bounce) * Math.sin(spin),
  );
}

function showProjectedDot(ctx: CanvasRenderingContext2D, time: number, position: Vector3D) {
  const t2 = constrain(mapRange(time, CHANGE_EVENT_TIME, 1, 0, 1), 0, 1);
  const newCameraZ = CAMERA_Z + easeP(Math.pow(t2, 1.2), 1.8) * CAMERA_TRAVEL_DISTANCE;
  if (position.z <= newCameraZ) return;
  const depth = position.z - newCameraZ;
  const x = (VIEW_ZOOM * position.x) / depth;
  const y = (VIEW_ZOOM * position.y) / depth;
  ctx.beginPath();
  ctx.arc(x, y, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

class Star {
  private dx: number;
  private dy: number;
  private spiralLocation: number;
  private z: number;
  private angle: number;
  private distance: number;
  private rotationDirection: number;
  private expansionRate: number;

  constructor() {
    this.angle = Math.random() * Math.PI * 2;
    this.distance = 30 * Math.random() + 15;
    this.rotationDirection = Math.random() > 0.5 ? 1 : -1;
    this.expansionRate = 1.2 + Math.random() * 0.8;
    this.dx = this.distance * Math.cos(this.angle);
    this.dy = this.distance * Math.sin(this.angle);
    this.spiralLocation = (1 - Math.pow(1 - Math.random(), 3.0)) / 1.3;
    this.z = Vector3D.random(0.5 * CAMERA_Z, CAMERA_TRAVEL_DISTANCE + CAMERA_Z);
    this.z = lerp(this.z, CAMERA_TRAVEL_DISTANCE / 2, 0.3 * this.spiralLocation);
  }

  render(p: number, ctx: CanvasRenderingContext2D, time: number) {
    const spiralPos = spiralPath(this.spiralLocation);
    const q = p - this.spiralLocation;
    if (q <= 0) return;

    const dp = constrain(4 * q, 0, 1);
    const linearEasing = dp;
    const elasticEasing = easeOutElastic(dp);
    const powerEasing = Math.pow(dp, 2);
    const easing =
      dp < 0.3
        ? lerp(linearEasing, powerEasing, dp / 0.3)
        : dp < 0.7
          ? lerp(powerEasing, elasticEasing, (dp - 0.3) / 0.4)
          : elasticEasing;

    let screenX: number;
    let screenY: number;
    if (dp < 0.3) {
      screenX = lerp(spiralPos.x, spiralPos.x + this.dx * 0.3, easing / 0.3);
      screenY = lerp(spiralPos.y, spiralPos.y + this.dy * 0.3, easing / 0.3);
    } else if (dp < 0.7) {
      const midProgress = (dp - 0.3) / 0.4;
      const curveStrength = Math.sin(midProgress * Math.PI) * this.rotationDirection * 1.5;
      const baseX = spiralPos.x + this.dx * 0.3;
      const baseY = spiralPos.y + this.dy * 0.3;
      const targetX = spiralPos.x + this.dx * 0.7;
      const targetY = spiralPos.y + this.dy * 0.7;
      const perpX = -this.dy * 0.4 * curveStrength;
      const perpY = this.dx * 0.4 * curveStrength;
      screenX = lerp(baseX, targetX, midProgress) + perpX * midProgress;
      screenY = lerp(baseY, targetY, midProgress) + perpY * midProgress;
    } else {
      const finalProgress = (dp - 0.7) / 0.3;
      const baseX = spiralPos.x + this.dx * 0.7;
      const baseY = spiralPos.y + this.dy * 0.7;
      const targetDistance = this.distance * this.expansionRate * 1.5;
      const spiralTurns = 1.2 * this.rotationDirection;
      const spiralAngle = this.angle + spiralTurns * finalProgress * Math.PI;
      const targetX = spiralPos.x + targetDistance * Math.cos(spiralAngle);
      const targetY = spiralPos.y + targetDistance * Math.sin(spiralAngle);
      screenX = lerp(baseX, targetX, finalProgress);
      screenY = lerp(baseY, targetY, finalProgress);
    }

    const vx = ((this.z - CAMERA_Z) * screenX) / VIEW_ZOOM;
    const vy = ((this.z - CAMERA_Z) * screenY) / VIEW_ZOOM;
    showProjectedDot(ctx, time, new Vector3D(vx, vy, this.z));
  }
}

class SpiralController {
  private raf = 0;
  private stopped = false;
  time = 0;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private stars: Star[];
  private dotColor: string;
  private accentColor: string;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dotColor: string,
    accentColor: string,
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.dotColor = dotColor;
    this.accentColor = accentColor;
    this.stars = Array.from({ length: NUMBER_OF_STARS }, () => new Star());
    this.start();
  }

  // Was a GSAP timeline driving `time` 0->1 on repeat. In production it
  // rendered exactly one frame and then froze: the component re-created
  // this controller on mount (see the dimensions effect below), the old
  // timeline was killed, and the replacement never ticked. Verified live
  // — fillRect/arc were called 0 times in 1.5s on the mounted canvas.
  // A plain rAF loop removes the dependency on GSAP's ticker entirely
  // and is trivially checkable. The spiral maths is untouched.
  private start() {
    const startedAt = performance.now();
    const frame = (now: number) => {
      if (this.stopped) return;
      this.time = ((now - startedAt) / 1000 / LOOP_DURATION) % 1;
      this.render();
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  private drawStartDot() {
    if (this.time <= CHANGE_EVENT_TIME) return;
    const dy = (CAMERA_Z * START_DOT_Y_OFFSET) / VIEW_ZOOM;
    showProjectedDot(this.ctx, this.time, new Vector3D(0, dy, CAMERA_TRAVEL_DISTANCE));
  }

  private drawTrail(t1: number) {
    this.ctx.fillStyle = this.dotColor;
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const f = mapRange(i, 0, TRAIL_LENGTH, 1.1, 0.1);
      const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f;

      const pathTime = t1 - 0.00015 * i;
      const position = spiralPath(pathTime);
      const offset = new Vector2D(position.x + 5, position.y + 5);
      const rotated = rotateAround(
        position,
        offset,
        Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5,
        i % 2 === 0,
      );

      this.ctx.beginPath();
      this.ctx.arc(rotated.x, rotated.y, sw / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);

    const t1 = constrain(mapRange(this.time, 0, CHANGE_EVENT_TIME + 0.25, 0, 1), 0, 1);
    const t2 = constrain(mapRange(this.time, CHANGE_EVENT_TIME, 1, 0, 1), 0, 1);
    ctx.rotate(-Math.PI * easeP(t2, 2.7));

    this.drawTrail(t1);

    ctx.fillStyle = this.dotColor;
    for (const star of this.stars) {
      star.render(t1, ctx, this.time);
    }

    ctx.fillStyle = this.accentColor;
    this.drawStartDot();

    ctx.restore();
  }

  destroy() {
    this.stopped = true;
    cancelAnimationFrame(this.raf);
  }
}

export function SpiralField({
  dotColor = '#e8e8ef',
  accentColor = '#7ef9ff',
  className,
}: {
  dotColor?: string;
  accentColor?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SpiralController | null>(null);
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    const handleResize = () =>
      setDimensions((prev) =>
        prev.width === window.innerWidth && prev.height === window.innerHeight
          ? prev // same numbers -> same object -> controller survives
          : { width: window.innerWidth, height: window.innerHeight },
      );
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = dimensions;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    controllerRef.current = new SpiralController(ctx, width, height, dotColor, accentColor);
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [dimensions, dotColor, accentColor]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
