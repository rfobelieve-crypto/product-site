'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function EntryCard({
  href,
  label,
  title,
  body,
}: {
  href: string;
  label: string;
  title: string;
  body: string;
}) {
  const t = useTranslations('chartsPage');
  return (
    <Link
      href={href}
      className="glass-panel group relative block overflow-hidden rounded-2xl border border-white/10 bg-ink/60 p-6 backdrop-blur-xl transition-colors hover:border-iris-cyan/30 sm:p-8"
    >
      <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet/80">
        {label}
      </span>
      <h2 className="mt-2 font-display text-xl font-light">{title}</h2>
      <p className="mt-3 max-w-md font-body text-sm text-mist/55">{body}</p>
      <span className="mt-6 inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.25em] text-iris-cyan/80 transition-colors group-hover:text-iris-cyan">
        {t('enter')}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}

export function LiveCharts() {
  const t = useTranslations('chartsPage');
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 sm:px-16">
      <EntryCard
        href="/charts/v7"
        label={t('v7.label')}
        title={t('v7.title')}
        body={t('v7.body')}
      />
      <EntryCard
        href="/charts/cancel-flow"
        label={t('cancelFlow.label')}
        title={t('cancelFlow.title')}
        body={t('cancelFlow.body')}
      />
    </div>
  );
}
