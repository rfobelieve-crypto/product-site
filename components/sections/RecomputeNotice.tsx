import { getTranslations } from 'next-intl/server';

/**
 * 2026-09-07 verdict banner for strategy #2 (sweep failure).
 *
 * The line's headline per-trade return rested on a passive fill AT the level.
 * `research/poc/honest_fill.py` in flow_system refuted that: on 57.9% of
 * trades the sweep bar itself closed back on the other side of the level, so
 * the booked price was never available (median 42.6 bps away). Recomputed
 * with a real executable price the number flips sign and goes 0/9 coins
 * positive.
 *
 * Per the operator's instruction the page carries NO performance figure until
 * history is re-scored — not the old value, not a corrected guess. This
 * component exists so the absence is explained rather than silent.
 */
export async function RecomputeNotice({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'chartsPage.recompute' });
  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.04] p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="rounded border border-amber-400/50 px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.18em] text-amber-300">
          {t('chip')}
        </span>
        <h2 className="font-display text-base font-light text-amber-100">
          {t('title')}
        </h2>
      </div>
      <div className="mt-3 space-y-2 font-body text-xs leading-relaxed text-mist/70">
        <p>{t('body')}</p>
        <p>{t('standing')}</p>
        <p>{t('pending')}</p>
        <p className="text-mist/50">{t('clocks')}</p>
      </div>
    </div>
  );
}
