'use client';

import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const ITEM_KEYS = [
  'advice',
  'strongTier',
  'confidenceInterval',
  'automated',
  'breaks',
] as const;

function Item({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
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
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
      >
        <span className="font-display text-base font-light sm:text-lg">{q}</span>
        <span
          aria-hidden
          className={`shrink-0 font-body text-lg text-iris-cyan/70 transition-transform ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      {open && (
        <motion.p
          id={panelId}
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
  const t = useTranslations('faq');
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
          {t('eyebrow')}
        </span>
        <h2 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
          {t('title')}
        </h2>
      </motion.div>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {ITEM_KEYS.map((key, i) => (
          <Item key={key} q={t(`items.${key}.q`)} a={t(`items.${key}.a`)} index={i} />
        ))}
      </div>
    </section>
  );
}
