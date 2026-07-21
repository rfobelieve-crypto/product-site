'use client';

import { motion } from 'framer-motion';

// Methodology numbers only — no performance/$ figures. Swap these for
// reviewed values before shipping; treat this array as the one place a
// stale number could leak onto the page.
const stats = [
  { value: '77', label: 'walk-forward folds, purge + embargo' },
  { value: '200+', label: 'engineered features, trailing-only' },
  { value: '31', label: 'hard-coded kill triggers' },
  { value: '4', label: 'deployment gates a feature must clear' },
];

export function Stats() {
  return (
    <section id="data" className="relative px-6 py-32 sm:px-16">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
            className="border-t border-mist/10 pt-4"
          >
            <div className="font-display text-3xl font-light text-iris-cyan sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-2 font-body text-xs leading-snug text-mist/50">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
