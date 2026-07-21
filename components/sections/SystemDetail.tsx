'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

// Merged Story + Features + Stats — each fact now appears exactly once.
// Architecture.tsx (the 4-stage pipeline strip) stays separate as the
// "at a glance" summary; this is the "detail" layer underneath it.
const CHAPTERS = [
  {
    kicker: '01 — Data',
    title: 'Three sources, one language.',
    body: 'Binance, Coinglass, and Deribit each speak a different schema and a different clock. Every field gets normalized before it touches a model — merge_asof, backward-aligned, so nothing downstream ever sees a value from the future.',
    items: ['Binance REST — klines, L20 depth, aggTrades', 'Coinglass v4 — 24 endpoints, timeseries + snapshot', 'Deribit — DVOL volatility index, options summary'],
  },
  {
    kicker: '02 — Modeling',
    title: 'Two models, never one guess.',
    body: 'Direction and magnitude are separate XGBoost regressors with independent pipelines and independent validation — a confident direction call and a confident size call are two different questions, answered separately.',
    items: ['200+ trailing-only engineered features, 12 groups', 'Regime detection — trending bull / bear / choppy / warmup', 'Rolling-percentile decode with an absolute-value floor', 'SHAP-driven explanation on every Strong-tier call'],
  },
  {
    kicker: '03 — Validation',
    title: 'Walk-forward, or it didn’t happen.',
    body: 'Every claim about signal decay, feature value, or regime shift is answered with out-of-sample prediction. In-sample numbers are not evidence here, no matter how clean they look.',
    items: ['77 walk-forward folds — purge + embargo, no leakage', 'Per-fold sanity gate: mean lift, fraction positive, bootstrap CI', 'Two-gate promotion — statistical edge, then live execution proof', 'Rolling IC monitoring with a decay alert, not set-and-forget'],
    cta: { href: '/track-record', label: 'See the live win rate + confidence intervals' },
  },
  {
    kicker: '04 — Risk & execution',
    title: 'Discipline written as code.',
    body: 'Drawdown triggers, leverage caps, daily loss limits — enforced by the executor, not by willpower. A kill trigger means a forced step back down the stage ladder, no exceptions.',
    items: ['31 hard-coded kill triggers — drawdown, connection loss, position limit, daily loss', 'Leverage ladder derived from Kelly + volatility-drag math, not vibes', 'Staged capital ladder — position size scales with proven track record', 'Manual approval on the first live order of any new stage'],
  },
];

function Chapter({ chapter }: { chapter: (typeof CHAPTERS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.4'],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [32, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }} className="max-w-2xl">
      <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet">
        {chapter.kicker}
      </span>
      <h2 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
        {chapter.title}
      </h2>
      <p className="mt-4 font-body text-sm leading-relaxed text-mist/60 sm:text-base">
        {chapter.body}
      </p>
      <ul className="mt-6 space-y-2">
        {chapter.items.map((it) => (
          <li key={it} className="font-body text-xs leading-relaxed text-mist/50 sm:text-sm">
            · {it}
          </li>
        ))}
      </ul>
      {chapter.cta && (
        <Link
          href={chapter.cta.href}
          className="mt-6 inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-iris-cyan/80 transition hover:text-iris-cyan"
        >
          {chapter.cta.label} →
        </Link>
      )}
    </motion.div>
  );
}

export function SystemDetail() {
  return (
    <section className="relative flex flex-col gap-[16vh] px-6 py-32 sm:px-16">
      {CHAPTERS.map((c) => (
        <Chapter key={c.kicker} chapter={c} />
      ))}
    </section>
  );
}
