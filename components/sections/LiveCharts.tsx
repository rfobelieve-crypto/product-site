'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

function ChartCard({ src, label, title }: { src: string; label: string; title: string }) {
  const t = useTranslations('chartsPage');
  const [failed, setFailed] = useState(false);

  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-ink/60 backdrop-blur-xl">
      <div className="p-6 pb-0 sm:p-8 sm:pb-0">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet/80">
          {label}
        </span>
        <h2 className="mt-2 font-display text-xl font-light">{title}</h2>
      </div>
      <div className="p-4 sm:p-6">
        {failed ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-white/5 bg-black/20 font-body text-sm text-mist/40">
            {t('unavailable')}
          </div>
        ) : (
          // Already-rendered, already-sized PNG relayed from Railway;
          // next/image's optimization pipeline would just re-fetch/re-encode
          // it for no benefit, and needing no next.config.js remotePatterns
          // entry keeps this independent of which Railway host serves it.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="w-full rounded-xl" onError={() => setFailed(true)} />
        )}
      </div>
    </div>
  );
}

export function LiveCharts({
  v7ChartUrl,
  cancelFlowChartUrl,
}: {
  v7ChartUrl: string;
  cancelFlowChartUrl: string;
}) {
  const t = useTranslations('chartsPage');
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 sm:px-16">
      <ChartCard src={v7ChartUrl} label={t('v7.label')} title={t('v7.title')} />
      <ChartCard src={cancelFlowChartUrl} label={t('cancelFlow.label')} title={t('cancelFlow.title')} />
    </div>
  );
}
