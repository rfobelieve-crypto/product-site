'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// The home page is the hook, not the content warehouse — everything it
// used to hold in full (data pipeline, capability list, methodology
// stats, incident log) now lives on its own page, reached from here.
const CARDS = [
  {
    href: '/system',
    kicker: 'System',
    title: 'How it actually works',
    body: 'Data pipeline, dual-model engine, validation, and the risk framework — one page, no repeats.',
  },
  {
    href: '/track-record',
    kicker: 'Track record',
    title: 'Win rate, with the uncertainty attached',
    body: 'Signal and trade win rates with Wilson confidence intervals, and max drawdown.',
  },
  {
    href: '/signals',
    kicker: 'Signals',
    title: 'Full tracked-signal history',
    body: 'Every call, direction to realized outcome — sign in to see the whole list.',
  },
  {
    href: '/incidents',
    kicker: 'Incidents',
    title: 'What broke, and what changed',
    body: 'A running log of real failures and the rule that shipped because of each one.',
  },
];

export function Explore() {
  return (
    <section id="explore" className="relative px-6 py-32 sm:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
          Explore
        </span>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-light leading-tight sm:text-4xl">
          Four pages. No repeats.
        </h2>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2">
        {CARDS.map((c, i) => (
          <motion.div
            key={c.href}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              href={c.href}
              className="glass-panel group block rounded-2xl border border-white/10 bg-ink/50 p-6 backdrop-blur-xl transition-colors hover:border-iris-cyan/40 sm:p-8"
            >
              <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet">
                {c.kicker}
              </span>
              <h3 className="mt-3 font-display text-xl font-light sm:text-2xl">{c.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-mist/60">{c.body}</p>
              <span className="mt-4 inline-block font-body text-xs uppercase tracking-[0.2em] text-iris-cyan/70 transition group-hover:text-iris-cyan">
                Open →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
