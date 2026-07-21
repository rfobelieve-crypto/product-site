'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const chapters = [
  {
    kicker: '01 — Data',
    title: 'Two exchanges, one language.',
    body: 'Binance and OKX speak different contract sizes and different clocks. Every trade gets normalized to a single canonical schema before it touches a model.',
  },
  {
    kicker: '02 — Validation',
    title: 'Walk-forward, or it didn’t happen.',
    body: 'Every claim about signal decay, feature value, or regime shift is answered with out-of-sample prediction. In-sample numbers are not evidence here, no matter how clean they look.',
  },
  {
    kicker: '03 — Risk',
    title: 'Discipline written as code.',
    body: 'Drawdown triggers, leverage caps, daily loss limits — enforced by the executor, not by willpower. A kill trigger means a forced step back down the stage ladder, no exceptions.',
  },
];

function Chapter({ kicker, title, body }: (typeof chapters)[number]) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.35'],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }} className="max-w-xl">
      <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet">
        {kicker}
      </span>
      <h2 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 font-body text-sm leading-relaxed text-mist/60 sm:text-base">
        {body}
      </p>
    </motion.div>
  );
}

export function Story() {
  return (
    <section id="system" className="relative flex flex-col gap-[40vh] px-6 py-[30vh] sm:px-16">
      {chapters.map((c) => (
        <Chapter key={c.title} {...c} />
      ))}
    </section>
  );
}
