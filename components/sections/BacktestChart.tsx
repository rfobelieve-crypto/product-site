'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

const CORE9 = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'LINK', 'AVAX'];
type Line = 'conj' | 'sweep';

/**
 * Historical backtest viewer — two strategy lines behind one page.
 *
 * `conj`  (primary, 2026-09-08): the conjunction line, i.e. the rule set
 *         going to small-size live. Rendered on the research machine and
 *         relayed by the agent from a DB row (no origin render exists).
 * `sweep` (closed 2026-09-07): the sweep-failure line, kept as the record
 *         of how it was refuted; its verdict banner (`sweepNotice`) only
 *         shows on that tab so it is not read as applying to the new line.
 *
 * The iframe carries an already-rendered interactive page (TradingView
 * Lightweight Charts) — same consumption pattern as ChartDetail, so the
 * same no-lazy-loading rule applies (the embedded page sizes its panes at
 * first paint; a lazily-activated iframe collapses them).
 *
 * `key` on the iframe forces a real remount when the line or the symbol
 * changes — without it React keeps the same element and some browsers reuse
 * the old document until the new one paints, which reads as "the chart
 * didn't change" on a slow origin render.
 */
export function BacktestChart({
  conjSrc,
  sweepSrc,
  sweepNotice,
}: {
  conjSrc: string;
  sweepSrc: string;
  sweepNotice?: ReactNode;
}) {
  const [line, setLine] = useState<Line>('conj');
  const [sym, setSym] = useState('BTC');
  const t = useTranslations('chartsPage.backtest');
  const g = useTranslations(`chartsPage.backtest.${line}`);
  const url = `${line === 'conj' ? conjSrc : sweepSrc}?symbol=${sym}`;
  const tab = (l: Line, label: string) => (
    <button
      key={l}
      type="button"
      onClick={() => setLine(l)}
      aria-pressed={l === line}
      className={
        'rounded border px-3 py-1 font-body text-[11px] tracking-wide transition-colors ' +
        (l === line
          ? 'border-iris-violet/60 bg-iris-violet/10 text-iris-violet'
          : 'border-white/[0.08] text-mist/55 hover:border-white/20 hover:text-mist')
      }
    >
      {label}
    </button>
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tab('conj', t('tabConj'))}
        {tab('sweep', t('tabSweep'))}
      </div>
      {line === 'sweep' && sweepNotice}
      <p className="font-body text-xs leading-relaxed text-mist/50">{g('note')}</p>
      <details className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
        <summary className="cursor-pointer font-body text-xs text-iris-cyan/80">
          {g('guideTitle')}
        </summary>
        <div className="mt-3 space-y-2 font-body text-[11px] leading-relaxed text-mist/55">
          <p>{g('guideMarks')}</p>
          <p>{g('guideTable')}</p>
          <p>{g('guideKpi')}</p>
          <p>{g('guideAudit')}</p>
        </div>
      </details>
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-ink/70">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/[0.06] px-4 py-2.5 sm:px-5">
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-iris-violet/80">
            {t('label')}
          </span>
          <h1 className="font-display text-base font-light">{g('title')}</h1>
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
            key={`${line}-${sym}`}
            src={url}
            title={`${sym} ${line} backtest`}
            className="h-[85vh] max-h-[1100px] min-h-[560px] w-full rounded-xl border-0"
          />
        </div>
      </div>
    </div>
  );
}
