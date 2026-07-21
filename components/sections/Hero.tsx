'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative flex h-screen flex-col items-center justify-center px-6 text-center">
      <motion.p
        custom={0}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mb-4 font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80"
      >
        Live on OKX · Dual-model signal engine
      </motion.p>

      <motion.h1
        custom={1}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="text-balance font-display text-5xl font-light leading-[1.05] tracking-tightest sm:text-7xl md:text-8xl"
      >
        A system that
        <br />
        <span className="font-medium">watches itself.</span>
      </motion.h1>

      <motion.p
        custom={2}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mt-6 max-w-md text-balance font-body text-sm text-mist/60 sm:text-base"
      >
        Every kill switch, every drawdown gate, every honest failure — built
        in the open and validated the hard way.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-mist/40">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="h-8 w-px bg-gradient-to-b from-iris-cyan to-transparent"
        />
      </motion.div>
    </section>
  );
}
