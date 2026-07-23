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
  accumulatingText,
}: {
  symbol: string;
  nMinutes: number;
  cancelRatio: number | null;
  skew: number | null;
  accumulatingText: string;
}) {
  const mature = nMinutes >= MATURE_MIN_MINUTES;
  const coin = symbol.replace('-USD', '');
  return (
    <div className="glass-panel rounded-2xl border border-white/10 bg-ink/60 p-5 backdrop-blur-xl">
      <div className="font-body text-xs uppercase tracking-[0.2em] text-mist/50">{coin}</div>
      {mature && cancelRatio != null ? (
        <>
          <div className="mt-2 font-display text-2xl font-light leading-none text-mist sm:text-3xl">
            {cancelRatio.toFixed(1)}%
          </div>
          <div className="mt-2 font-body text-xs text-iris-cyan/70">
            {skew != null
              ? `${skew >= 0 ? '↑ ask' : '↓ bid'} ${Math.abs(skew).toFixed(1)}%`
              : '—'}
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
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.coins.map((c) => (
          <CoinCard
            key={c.symbol}
            symbol={c.symbol}
            nMinutes={c.n_minutes}
            cancelRatio={c.cancel_ratio_pct}
            skew={c.ask_bid_skew_pct}
            accumulatingText={t('accumulating', { n: c.n_minutes })}
          />
        ))}
      </div>
      <p className="mt-4 font-body text-xs leading-relaxed text-mist/40">{stats.disclaimer}</p>
    </div>
  );
}
