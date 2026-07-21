# flowbot product site

Dark, glass-morphism landing page for the BTC system — Next.js 15 App
Router, React 19, TypeScript, Tailwind, Framer Motion, React Three Fiber v9.

> Runs on Next 15 / React 19 rather than Next 14 / React 18: Next 14 has
> several unpatched high-severity CVEs, and React Three Fiber v8 crashes
> structurally under Next 15's App Router (`react-reconciler@0.27` reads
> React 18's internals shape; Next 15's client bundle uses its own bundled
> React 19 regardless of what's pinned in package.json). R3F v9 vendors its
> own reconciler built for React 19 and has no such mismatch.

## Run it

```bash
npm install
npm run dev
```

## File structure

```
app/
  layout.tsx          root layout — fonts, metadata, viewport
  page.tsx             thin server component, renders <HomeExperience/>
  globals.css          Tailwind layers + canvas/content stacking

components/
  HomeExperience.tsx    client shell — owns the scroll ref, wires scroll
                        progress into the 3D layer
  canvas/
    Scene.tsx           <Canvas>, lighting, mobile-aware DPR
    SceneWrapper.tsx     next/dynamic(ssr:false) + Suspense boundary
    FloatingObject.tsx   the mesh — rotation/position driven by scroll
    iridescentMaterial.ts  custom GLSL shader (fresnel rainbow + simplex
                        noise vertex displacement)
    CanvasLoader.tsx     Suspense fallback (no WebGL work, safe on server)
  sections/
    Hero.tsx, Story.tsx, Stats.tsx, Footer.tsx

lib/
  hooks/useScrollProgress.ts   spring-smoothed 0→1 scroll value
```

## Performance choices (why, not just what)

- **The `<Canvas>` is `next/dynamic(..., { ssr: false })`.** Three.js touches
  `window`/WebGL at import time, which crashes during SSR — `ssr:false`
  removes it from the server bundle entirely rather than just deferring
  execution, which is what actually reduces first-load JS.
- **DPR is capped on mobile** (`[1, 1.5]` vs `[1, 2]`) — a full-retina WebGL
  canvas sitting behind scrolling text is the most common cause of scroll
  jank in this genre of site.
- **`useMotionValueEvent` bridges Framer Motion → R3F.** Framer's
  `MotionValue` is meant for CSS/SVG; `useFrame` wants a plain number each
  frame, so `HomeExperience` mirrors the spring value into `useState` once
  per change instead of subscribing inside the 3D layer.
- **Fonts load via `next/font`**, not a `<link>` tag — self-hosted, zero
  layout shift, no separate render-blocking request.

## Mobile

Tailwind handles layout responsiveness (`sm:`/`md:` breakpoints in every
section). The 3D layer degrades quality (not geometry) on small viewports —
same mesh, cheaper pixels.

## Before shipping

- `components/sections/Stats.tsx` has **placeholder methodology numbers**
  (fold count, feature count, kill-trigger count) — swap for reviewed
  values. No performance/$ figures belong on this page per the project's
  own content rule (rigor reads better than returns to a sophisticated
  audience).
- Hero/Story copy is a starting draft, not final.
- No analytics wired up yet.
