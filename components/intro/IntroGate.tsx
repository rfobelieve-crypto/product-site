'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SmokyText } from '@/components/effects/SmokyText';

const SpiralField = dynamic(() => import('./SpiralField').then((m) => m.SpiralField), {
  ssr: false,
});

const SESSION_KEY = 'flowbot-intro-seen';

/**
 * One-time ceremony before the homepage, gated per browser session.
 *
 * Fixed vs the original: children are ALWAYS mounted — the gate is a
 * pure overlay. The server-rendered HTML therefore contains the full
 * homepage (crawlers and reader modes see real content), instead of a
 * black <div> and nothing else. prefers-reduced-motion skips the
 * ceremony entirely. The headline is localized (was hardcoded English).
 */
export function IntroGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations('intro');
  const [showGate, setShowGate] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(reduced);
    setShowGate(!reduced && sessionStorage.getItem(SESSION_KEY) !== '1');
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setShowGate(false);
  };

  return (
    <>
      {children}
      {/* Opaque cover during the first client tick so there's no flash of
          homepage before the gate decision — content is still in the DOM. */}
      {showGate === null && <div className="fixed inset-0 z-[60] bg-void" aria-hidden />}
      <AnimatePresence>
        {showGate && (
          <motion.div
            key="intro-gate"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-void"
          >
            {!reducedMotion && <SpiralField className="absolute inset-0" />}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 px-6">
              <SmokyText
                text={t('title')}
                color="#e8e8ef"
                glowColor="#7ef9ff"
                idleGlow
                animationMode="inPlace"
                fontSize={46}
                fontWeight={700}
                delay={0.3}
                duration={1.8}
                intensity={8}
              />
            </div>
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
    </>
  );
}
