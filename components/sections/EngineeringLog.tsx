'use client';

import { motion } from 'framer-motion';

// Adapted from the project's internal mistake log — the rule after each
// entry is what actually shipped, not a summary written after the fact.
// Picked for range (infra correctness / statistical rigor / data
// integrity), not for how flattering they are.
const INCIDENTS = [
  {
    date: '2026-06-17',
    title: 'The same bug, three times',
    body: "A margin-mode toggle silently stopped every live order from going out. Root cause: a method existed at the call site and at the low-level API client, but the facade layer connecting them was never updated — the third time this exact class of bug had shipped. Tests stayed green because the test double auto-created whatever method was called on it.",
    fix: 'Replaced the mock with an AST-based structural test that fails if the facade drifts from what the call sites actually need — verified by deleting a method and watching the test catch it.',
  },
  {
    date: '2026-06-02',
    title: 'A lift that wasn’t there',
    body: 'An ensemble A/B test showed a clean, above-threshold accuracy improvement in aggregate. A five-minute sanity pass — per-fold mean, fraction of folds with positive lift, bootstrap CI — showed the aggregate number was propped up by one or two outlier folds; the median lift was negative.',
    fix: 'Any claimed model improvement now has to clear four checks together (aggregate lift, per-fold mean, fraction positive, bootstrap CI excludes zero), not just the headline number.',
  },
  {
    date: '2026-07-05',
    title: 'A drift that was a stale cache',
    body: 'A scheduled model-health report showed accuracy quietly degrading month over month — worth a public post about model decay. The underlying cause was a network blip during a nightly data refresh; the report had silently run on 16-day-old cached features instead of failing loudly.',
    fix: 'Any automated verdict now checks data freshness as part of the verdict itself — stale input forces an explicit "cannot determine" state instead of a plausible-looking PASS or FAIL.',
  },
];

export function EngineeringLog() {
  return (
    <section id="incidents" className="relative px-6 py-32 sm:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-rose">
          Incidents
        </span>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-light leading-tight sm:text-4xl">
          What broke, and what changed because of it.
        </h2>
        <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-mist/60 sm:text-base">
          A running log of real failures — kept because the rule that came
          out of each one is the actual product of the mistake.
        </p>
      </motion.div>

      <div className="flex flex-col gap-5">
        {INCIDENTS.map((inc, i) => (
          <motion.div
            key={inc.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl border border-white/10 bg-ink/50 p-6 backdrop-blur-xl sm:p-8"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-body text-xs text-mist/55">{inc.date}</span>
              <h3 className="font-display text-lg font-light sm:text-xl">{inc.title}</h3>
            </div>
            <p className="mt-3 font-body text-sm leading-relaxed text-mist/60">{inc.body}</p>
            <p className="mt-3 border-t border-white/10 pt-3 font-body text-xs leading-relaxed text-iris-cyan/70">
              → {inc.fix}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
