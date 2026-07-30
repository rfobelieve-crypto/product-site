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
      className="group relative flex flex-col rounded-xl border border-white/[0.08] bg-ink/70 p-5 transition-colors hover:border-iris-cyan/30"
    >
      <span className="font-body text-[10px] uppercase tracking-[0.2em] text-iris-violet/80">
        {label}
      </span>
      <h2 className="mt-1.5 font-display text-base font-light">{title}</h2>
      <p className="mt-2 flex-1 font-body text-xs leading-relaxed text-mist/50">{body}</p>
      <span className="mt-4 inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-iris-cyan/80 transition-colors group-hover:text-iris-cyan">
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
    <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-3 sm:px-8">
      <EntryCard
        href="/charts/v7"
        label={t('v7.label')}
        title={t('v7.title')}
        body={t('v7.body')}
      />
      <EntryCard
        href="/charts/liquidity"
        label={t('liquidity.label')}
        title={t('liquidity.title')}
        body={t('liquidity.body')}
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
