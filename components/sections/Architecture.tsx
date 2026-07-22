'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const STAGE_KEYS = ['data', 'features', 'models', 'signal'] as const;

function Node({ stageKey, index }: { stageKey: (typeof STAGE_KEYS)[number]; index: number }) {
  const t = useTranslations('architecture.stages');
  const items = t.raw(`${stageKey}.items`) as string[];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="glass-panel flex-1 rounded-2xl border border-white/10 bg-ink/50 p-6 backdrop-blur-xl"
    >
      <span className="font-body text-[11px] uppercase tracking-[0.3em] text-iris-cyan/70">
        {t(`${stageKey}.kicker`)}
      </span>
      <h3 className="mt-3 font-display text-lg font-light leading-snug sm:text-xl">
        {t(`${stageKey}.title`)}
      </h3>
      <ul className="mt-4 space-y-1.5">
        {items.map((it) => (
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
  const t = useTranslations('architecture');
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
          {t('eyebrow')}
        </span>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-light leading-tight sm:text-4xl">
          {t('title')}
        </h2>
      </motion.div>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-stretch">
        {STAGE_KEYS.map((key, i) => (
          <Fragment key={key}>
            <Node stageKey={key} index={i} />
            {i < STAGE_KEYS.length - 1 && <FlowLine />}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
