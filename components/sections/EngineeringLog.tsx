'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

// Adapted from the project's internal mistake log — the rule after each
// entry is what actually shipped, not a summary written after the fact.
// Picked for range (infra correctness / statistical rigor / data
// integrity), not for how flattering they are.
const INCIDENT_KEYS = ['facade', 'outlierFold', 'staleCache'] as const;

export function EngineeringLog() {
  const t = useTranslations('incidents');
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
          {t('eyebrow')}
        </span>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-light leading-tight sm:text-4xl">
          {t('title')}
        </h2>
        <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-mist/60 sm:text-base">
          {t('subtitle')}
        </p>
      </motion.div>

      <div className="flex flex-col gap-5">
        {INCIDENT_KEYS.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass-panel rounded-2xl border border-white/10 bg-ink/50 p-6 backdrop-blur-xl sm:p-8"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-body text-xs text-mist/55">{t(`list.${key}.date`)}</span>
              <h3 className="font-display text-lg font-light sm:text-xl">
                {t(`list.${key}.title`)}
              </h3>
            </div>
            <p className="mt-3 font-body text-sm leading-relaxed text-mist/60">
              {t(`list.${key}.body`)}
            </p>
            <p className="mt-3 border-t border-white/10 pt-3 font-body text-xs leading-relaxed text-iris-cyan/70">
              → {t(`list.${key}.fix`)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
