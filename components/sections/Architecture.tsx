'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';

const STAGES = [
  {
    kicker: 'Data',
    title: 'Three exchanges, no gaps',
    items: ['Binance klines / depth / aggTrades', 'Coinglass v4 — 24 endpoints', 'Deribit DVOL + options summary'],
  },
  {
    kicker: 'Features',
    title: '200+ engineered, trailing-only',
    items: ['12 feature groups', 'merge_asof, backward-aligned', 'no look-ahead, anywhere'],
  },
  {
    kicker: 'Models',
    title: 'Dual XGBoost, independent',
    items: ['Direction regressor', 'Magnitude regressor', 'separate pipelines, separate validation'],
  },
  {
    kicker: 'Signal',
    title: 'Tier, confidence, regime',
    items: ['rolling-percentile decode', 'walk-forward validated', 'published with a confidence number, not certainty'],
  },
];

function Node({ stage, index }: { stage: (typeof STAGES)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="relative flex-1 rounded-2xl border border-white/10 bg-ink/50 p-6 backdrop-blur-xl"
    >
      <span className="font-body text-[11px] uppercase tracking-[0.3em] text-iris-cyan/70">
        {stage.kicker}
      </span>
      <h3 className="mt-3 font-display text-lg font-light leading-snug sm:text-xl">
        {stage.title}
      </h3>
      <ul className="mt-4 space-y-1.5">
        {stage.items.map((it) => (
          <li key={it} className="font-body text-xs leading-relaxed text-mist/50">
            · {it}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function FlowLine() {
  return (
    <div className="relative mx-1 hidden h-px w-8 shrink-0 self-center bg-white/15 sm:block md:w-12">
      <motion.div
        className="absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-iris-cyan shadow-[0_0_6px_2px_rgba(126,249,255,0.7)]"
        animate={{ left: ['0%', '100%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function Architecture() {
  return (
    <section id="architecture" className="relative px-6 py-32 sm:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet">
          At a glance
        </span>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-light leading-tight sm:text-4xl">
          Raw exchange data to a published signal, four stages, no shortcuts.
        </h2>
      </motion.div>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-stretch">
        {STAGES.map((stage, i) => (
          <Fragment key={stage.kicker}>
            <Node stage={stage} index={i} />
            {i < STAGES.length - 1 && <FlowLine />}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
