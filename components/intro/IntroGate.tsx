'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

// Plain Canvas 2D, not react-three-fiber — a second WebGL context would
// stack on top of the hero's Scene instead of standing in front of it, so
// this stays independent and unmounts entirely once dismissed. ssr:false
// for the same reason CandleField/Scene are: touches window at import time.
const SpiralField = dynamic(() => import('./SpiralField').then((m) => m.SpiralField), {
  ssr: false,
});

const SESSION_KEY = 'flowbot-intro-seen';

/**
 * One-time ceremony before the homepage, gated per browser session
 * (sessionStorage — reappears on a fresh tab/browser restart, not on
 * every in-session reload or route change; other routes never mount
 * this at all). `showGate` starts `null` so server and first client
 * render agree on nothing shown yet, avoiding a hydration flash.
 */
export function IntroGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations('intro');
  const [showGate, setShowGate] = useState<boolean | null>(null);

  useEffect(() => {
    setShowGate(sessionStorage.getItem(SESSION_KEY) !== '1');
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setShowGate(false);
  };

  if (showGate === null) {
    return <div className="fixed inset-0 z-[60] bg-void" />;
  }

  return (
    <>
      <AnimatePresence>
        {showGate && (
          <motion.div
            key="intro-gate"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-void"
          >
            <SpiralField className="absolute inset-0" />
            {/* Bottom-anchored, not centered — the spiral's own vanishing
                point sits dead-center, so plain text there collided with
                the busiest part of the animation. Pill shape + border +
                backdrop-blur gives it the weight of an actual control
                instead of stray text; the idle pulse borrows the same
                "gentle loop invites interaction" language as Hero's
                scroll-hint line. */}
            <motion.button
              type="button"
              onClick={dismiss}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, scale: [1, 1.035, 1] }}
              transition={{
                opacity: { delay: 1.6, duration: 1.1, ease: [0.16, 1, 0.3, 1] },
                y: { delay: 1.6, duration: 1.1, ease: [0.16, 1, 0.3, 1] },
                scale: { delay: 2.7, duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="group absolute bottom-16 rounded-full border border-iris-cyan/30 bg-void/40 px-9 py-3 font-body text-xs uppercase tracking-[0.4em] text-mist/85 backdrop-blur-sm transition-colors duration-500 hover:border-iris-cyan/70 hover:text-iris-cyan hover:shadow-[0_0_28px_-6px_rgba(126,249,255,0.55)] sm:bottom-24"
            >
              {t('enter')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {showGate === false && children}
    </>
  );
}
