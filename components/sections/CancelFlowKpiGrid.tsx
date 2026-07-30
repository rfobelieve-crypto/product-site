import { getTranslations } from 'next-intl/server';
import { getCancelFlowStats } from '@/lib/cancelFlowStats';

// Below this, cancel_ratio_pct is too noisy to present as a stable read —
// show an "accumulating" note instead of a number that will visibly jump
// around every refresh. Not a statistical threshold (that's the separate
// pre-registered n>=40,000 gate for the actual F1/F2 tests) — just enough
// samples that a percentage on a card doesn't look broken.
const MATURE_MIN_MINUTES = 500;

function CoinCard({
  symbol,
  nMinutes,
  cancelRatio,
  skew,
  skewText,
  accumulatingText,
}: {
  symbol: string;
  nMinutes: number;
  cancelRatio: number | null;
  skew: number | null;
  skewText: string | null;
  accumulatingText: string;
}) {
  const mature = nMinutes >= MATURE_MIN_MINUTES;
  const coin = symbol.replace('-USD', '');
  // Neutral accent colors, not the site's green/red (those already carry
  // "bullish/bearish" meaning elsewhere on the site — reusing them here
  // would silently imply a directional call this metric hasn't earned;
  // see chat, 2026-07-24). iris-violet/iris-cyan just distinguish "which
  // side," no valence attached.
  const skewColor = skew != null && skew >= 0 ? 'text-iris-violet/80' : 'text-iris-cyan/80';
  return (
    <div className="rounded-xl border border-white/[0.08] bg-ink/70 p-4">
      <div className="font-body text-xs uppercase tracking-[0.2em] text-mist/50">{coin}</div>
      {mature && cancelRatio != null ? (
        <>
          <div className="mt-2 font-display text-2xl font-light leading-none text-mist sm:text-3xl">
            {cancelRatio.toFixed(1)}%
          </div>
          <div className={`mt-2 font-body text-xs ${skewColor}`}>
            {skewText ?? '—'}
          </div>
        </>
      ) : (
        <>
          <div className="mt-2 font-display text-2xl font-light leading-none text-mist/30 sm:text-3xl">
            —
          </div>
          <div className="mt-2 font-body text-xs text-mist/40">
            {accumulatingText}
          </div>
        </>
      )}
    </div>
  );
}

export async function CancelFlowKpiGrid({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'chartsPage.cancelFlow.kpi' });
  const stats = await getCancelFlowStats();

  if (!stats || stats.coins.length === 0) {
    return <p className="font-body text-sm text-mist/40">{t('unavailable')}</p>;
  }

  return (
    <div>
      <h2 className="font-display text-lg font-light">{t('title')}</h2>
      <p className="mt-2 max-w-2xl font-body text-sm text-mist/55">{t('body')}</p>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.coins.map((c) => {
          const skew = c.ask_bid_skew_pct;
          const skewText = skew == null ? null : t(skew >= 0 ? 'askDominant' : 'bidDominant',
            { pct: Math.abs(skew).toFixed(1) });
          return (
            <CoinCard
              key={c.symbol}
              symbol={c.symbol}
              nMinutes={c.n_minutes}
              cancelRatio={c.cancel_ratio_pct}
              skew={skew}
              skewText={skewText}
              accumulatingText={t('accumulating', { n: c.n_minutes })}
            />
          );
        })}
      </div>
      <p className="mt-4 font-body text-xs leading-relaxed text-mist/40">{stats.disclaimer}</p>
    </div>
  );
}
