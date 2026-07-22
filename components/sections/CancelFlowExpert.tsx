'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// Pixel boundaries measured directly from a real fetched
// /public/cancel-flow-chart PNG (1467×1247 — research/plot_cancel_flow.py's
// 3-subplot figure, height_ratios [3, 2.4, 1.8]). Not derived from those
// ratios by formula — bbox_inches="tight" cropping plus title/label space
// don't survive that math cleanly, so these came from cropping a real
// sample and eyeballing the result until every axis label and the full
// price range were intact. Pure front-end crop of one image, no new
// backend route (see TODO.md — this was an explicit scope decision).
const NATURAL_WIDTH = 1467;

const PANELS = [
  { key: 'price', topPx: 150, heightPx: 465 },
  { key: 'imbalance', topPx: 578, heightPx: 350 },
  { key: 'intensity', topPx: 930, heightPx: 317 },
] as const;

function CroppedPanel({
  src,
  topPx,
  heightPx,
  label,
  title,
}: {
  src: string;
  topPx: number;
  heightPx: number;
  label: string;
  title: string;
}) {
  const t = useTranslations('chartsPage');
  const [failed, setFailed] = useState(false);
  const topPct = (topPx / heightPx) * 100;

  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-ink/60 backdrop-blur-xl">
      <div className="p-6 pb-3 sm:p-8 sm:pb-4">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet/80">
          {label}
        </span>
        <h2 className="mt-2 font-display text-lg font-light">{title}</h2>
      </div>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        {failed ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-white/5 bg-black/20 font-body text-sm text-mist/40">
            {t('unavailable')}
          </div>
        ) : (
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: `${NATURAL_WIDTH} / ${heightPx}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={title}
              onError={() => setFailed(true)}
              className="absolute left-0 w-full max-w-none"
              style={{ top: `-${topPct}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function CancelFlowExpert({ src }: { src: string }) {
  const t = useTranslations('chartsPage.cancelFlow.panels');
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 sm:px-16">
      {PANELS.map((p) => (
        <CroppedPanel
          key={p.key}
          src={src}
          topPx={p.topPx}
          heightPx={p.heightPx}
          label={t(`${p.key}.label`)}
          title={t(`${p.key}.title`)}
        />
      ))}
    </div>
  );
}
