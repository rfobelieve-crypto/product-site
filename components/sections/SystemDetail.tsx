'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// Merged Story + Features + Stats — each fact now appears exactly once.
// Architecture.tsx (the 4-stage pipeline strip) stays separate as the
// "at a glance" summary; this is the "detail" layer underneath it.
const CHAPTER_KEYS = ['data', 'modeling', 'validation', 'risk'] as const;
const CHAPTER_CTA_HREF: Partial<Record<(typeof CHAPTER_KEYS)[number], string>> = {
  validation: '/track-record',
};

function Chapter({ chapterKey }: { chapterKey: (typeof CHAPTER_KEYS)[number] }) {
  const t = useTranslations('systemDetail.chapters');
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.4'],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [32, 0]);
  const items = t.raw(`${chapterKey}.items`) as string[];
  const ctaHref = CHAPTER_CTA_HREF[chapterKey];

  return (
    <motion.div ref={ref} style={{ opacity, y }} className="max-w-2xl">
      <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet">
        {t(`${chapterKey}.kicker`)}
      </span>
      <h2 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
        {t(`${chapterKey}.title`)}
      </h2>
      <p className="mt-4 font-body text-sm leading-relaxed text-mist/60 sm:text-base">
        {t(`${chapterKey}.body`)}
      </p>
      <ul className="mt-6 space-y-2">
        {items.map((it) => (
          <li key={it} className="font-body text-xs leading-relaxed text-mist/50 sm:text-sm">
            · {it}
          </li>
        ))}
      </ul>
      {ctaHref && (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-iris-cyan/80 transition hover:text-iris-cyan"
        >
          {t(`${chapterKey}.ctaLabel`)} →
        </Link>
      )}
    </motion.div>
  );
}

export function SystemDetail() {
  return (
    <section className="relative flex flex-col gap-[16vh] px-6 py-32 sm:px-16">
      {CHAPTER_KEYS.map((key) => (
        <Chapter key={key} chapterKey={key} />
      ))}
    </section>
  );
}
