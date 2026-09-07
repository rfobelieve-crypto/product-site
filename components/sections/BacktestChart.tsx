'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const CORE9 = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'LINK', 'AVAX'];

/**
 * Historical backtest viewer for strategy #2.
 *
 * The iframe carries an already-rendered interactive page (TradingView
 * Lightweight Charts) relayed from Railway — same consumption pattern as
 * ChartDetail, so the same no-lazy-loading rule applies (the embedded page
 * sizes its panes at first paint; a lazily-activated iframe collapses them).
 *
 * The only thing this component adds over ChartDetail is the symbol switch.
 * `key` on the iframe forces a real remount when the symbol changes —
 * without it React keeps the same element and some browsers reuse the old
 * document until the new one paints, which reads as "the chart didn't
 * change" on a slow origin render.
 */
export function BacktestChart({ src }: { src: string }) {
  const [sym, setSym] = useState('BTC');
  const t = useTranslations('chartsPage.backtest');
  const url = `${src}?symbol=${sym}`;
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-ink/70">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/[0.06] px-4 py-2.5 sm:px-5">
        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-iris-violet/80">
          {t('label')}
        </span>
        <h1 className="font-display text-base font-light">{t('title')}</h1>
      </div>
      <div className="flex flex-wrap gap-1.5 border-b border-white/[0.06] px-4 py-2.5 sm:px-5">
        {CORE9.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSym(s)}
            aria-pressed={s === sym}
            className={
              'rounded border px-2.5 py-1 font-body text-[11px] tracking-wide transition-colors ' +
              (s === sym
                ? 'border-iris-cyan/50 bg-iris-cyan/10 text-iris-cyan'
                : 'border-white/[0.08] text-mist/55 hover:border-white/20 hover:text-mist')
            }
          >
            {s}
          </button>
        ))}
        <span className="ml-auto self-center font-body text-[10px] text-mist/40">
          {t('renderNote')}
        </span>
      </div>
      <div className="p-2 sm:p-3">
        <iframe
          key={sym}
          src={url}
          title={`${sym} backtest`}
          className="h-[85vh] max-h-[1100px] min-h-[560px] w-full rounded-xl border-0"
        />
      </div>
    </div>
  );
}
