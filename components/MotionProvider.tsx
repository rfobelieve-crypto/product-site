'use client';

import { MotionConfig } from 'framer-motion';

// framer-motion only honors prefers-reduced-motion when told to.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
