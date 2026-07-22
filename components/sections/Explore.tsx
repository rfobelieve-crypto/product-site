'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// The home page is the hook, not the content warehouse — everything it
// used to hold in full (data pipeline, capability list, methodology
// stats, incident log) now lives on its own page, reached from here.
const CARD_KEYS = ['system', 'trackRecord', 'signals', 'incidents'] as const;
const CARD_HREFS: Record<(typeof CARD_KEYS)[number], string> = {
  system: '/system',
  trackRecord: '/track-record',
  signals: '/signals',
  incidents: '/incidents',
};

export function Explore() {
  const t = useTranslations('explore');
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
          {t('eyebrow')}
        </span>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-light leading-tight sm:text-4xl">
          {t('title')}
        </h2>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2">
        {CARD_KEYS.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              href={CARD_HREFS[key]}
              className="glass-panel group block rounded-2xl border border-white/10 bg-ink/50 p-6 backdrop-blur-xl transition-colors hover:border-iris-cyan/40 sm:p-8"
            >
              <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet">
                {t(`cards.${key}.kicker`)}
              </span>
              <h3 className="mt-3 font-display text-xl font-light sm:text-2xl">
                {t(`cards.${key}.title`)}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-mist/60">
                {t(`cards.${key}.body`)}
              </p>
              <span className="mt-4 inline-block font-body text-xs uppercase tracking-[0.2em] text-iris-cyan/70 transition group-hover:text-iris-cyan">
                {t('open')} →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
