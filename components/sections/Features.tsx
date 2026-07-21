'use client';

import { motion } from 'framer-motion';

// Capability overview, not a feature-engineering spec sheet — lists what
// the system DOES, never the underlying ML feature names/cutoffs/weights
// (see .claude/rules/agent-boundary.md: model internals stay internal).
const GROUPS = [
  {
    title: 'Data',
    items: [
      'Binance REST — klines, L20 depth, aggTrades',
      'Coinglass v4 — 24 endpoints, timeseries + snapshot',
      'Deribit — DVOL volatility index, options summary',
      'Canonical schema across exchanges, no per-adapter drift',
    ],
  },
  {
    title: 'Modeling',
    items: [
      'Dual XGBoost — independent direction + magnitude regressors',
      '200+ trailing-only engineered features, 12 groups',
      'Regime detection — trending bull / bear / choppy / warmup',
      'Rolling-percentile decode with an absolute-value floor',
      'SHAP-driven explanation on every Strong-tier call',
    ],
  },
  {
    title: 'Validation',
    items: [
      '77 walk-forward folds — purge + embargo, no leakage',
      'Per-fold sanity gate: mean lift, fraction positive, bootstrap CI',
      'Two-gate promotion — statistical edge, then live execution proof',
      'Rolling IC monitoring with a decay alert, not a set-and-forget model',
    ],
  },
  {
    title: 'Risk & execution',
    items: [
      '31 hard-coded kill triggers — drawdown, connection loss, position limit, daily loss',
      'Leverage ladder derived from Kelly + volatility-drag math, not vibes',
      'Staged capital ladder — position size scales with proven track record',
      'Manual approval on the first live order of any new stage',
    ],
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-32 sm:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
          Capabilities
        </span>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-light leading-tight sm:text-4xl">
          Everything the system does, in one list.
        </h2>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {GROUPS.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.5, delay: gi * 0.1 }}
          >
            <h3 className="font-display text-sm font-medium uppercase tracking-[0.2em] text-iris-violet">
              {group.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {group.items.map((it) => (
                <li key={it} className="font-body text-xs leading-relaxed text-mist/60">
                  {it}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
