'use client';

import { useScroll, useSpring, MotionValue } from 'framer-motion';
import { RefObject } from 'react';

/**
 * Smoothed 0→1 progress across the full page, used to drive the 3D scene.
 * Spring-damped so the mesh drifts instead of snapping to the scrollbar.
 */
export function useScrollProgress(target: RefObject<HTMLElement | null>): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end end'] });
  return useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.4 });
}
