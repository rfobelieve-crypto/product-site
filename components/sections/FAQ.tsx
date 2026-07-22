'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const ITEMS = [
  {
    q: 'Is this financial advice, or something I can subscribe to?',
    a: 'No. Nothing on this site is a trading signal you can act on, and there is no paid subscription or signal-access product. This site documents how a real system is built and validated — the disclaimers throughout are literal, not boilerplate.',
  },
  {
    q: 'What does "Strong-tier signal" actually mean?',
    a: 'The direction model outputs a continuous prediction; a rolling-percentile decode sorts recent predictions into Strong / Moderate / Weak. Strong means the current prediction sits in the top slice of recent model output — not a guarantee, a rank.',
  },
  {
    q: 'Why show a confidence interval instead of just a win rate?',
    a: 'A win rate on a small sample can look identical whether the edge is real or the sample got lucky. The interval is the honest version of the same number — see the Track Record page.',
  },
  {
    q: 'Is the system fully automated?',
    a: 'Execution is automated within a staged risk framework — position size, leverage, and daily/total loss caps are hard-coded, not discretionary. Scaling to a new capital stage requires clearing pre-defined statistical gates, not "it felt like a good week."',
  },
  {
    q: 'What happens when something breaks?',
    a: 'It gets fixed, and the fix is written down — see the Incidents section. Kill switches exist specifically because the system is expected to eventually be wrong in a way nobody anticipated.',
  },
];

function Item({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-panel rounded-2xl border border-white/10 bg-ink/50 backdrop-blur-xl"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
      >
        <span className="font-display text-base font-light sm:text-lg">{q}</span>
        <span
          className={`shrink-0 font-body text-lg text-iris-cyan/70 transition-transform ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden px-6 pb-6 font-body text-sm leading-relaxed text-mist/60 sm:px-8"
        >
          {a}
        </motion.p>
      )}
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="relative px-6 py-32 sm:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet">
          FAQ
        </span>
        <h2 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
          Questions worth answering directly.
        </h2>
      </motion.div>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {ITEMS.map((item, i) => (
          <Item key={item.q} q={item.q} a={item.a} index={i} />
        ))}
      </div>
    </section>
  );
}
