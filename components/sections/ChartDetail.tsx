'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ChartDetail({
  src,
  label,
  title,
}: {
  src: string;
  label: string;
  title: string;
}) {
  const t = useTranslations('chartsPage');
  const [failed, setFailed] = useState(false);

  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-ink/60 backdrop-blur-xl">
      <div className="p-6 pb-0 sm:p-8 sm:pb-0">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet/80">
          {label}
        </span>
        <h1 className="mt-2 font-display text-xl font-light">{title}</h1>
      </div>
      <div className="p-4 sm:p-6">
        {failed ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-white/5 bg-black/20 font-body text-sm text-mist/40">
            {t('unavailable')}
          </div>
        ) : (
          // Already-rendered, already-sized PNG relayed from Railway; see
          // lib/charts.ts.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="w-full rounded-xl" onError={() => setFailed(true)} />
        )}
      </div>
    </div>
  );
}
