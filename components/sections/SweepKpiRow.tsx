import { getTranslations } from 'next-intl/server';
import { getSweepStatus, SWEEP_B_VERDICT, SWEEP_SETTLED } from '@/lib/sweepStatus';
import { StatCard, StatCardGrid } from '@/components/sections/StatCard';

// Server component, same degrade contract as V7KpiRow: a status outage
// renders dashes, never an error. Numbers are the Variant B gate stats the
// shadow recorder itself reports (indicator/agent /public/sweep-status).
export async function SweepKpiRow({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'chartsPage.liquidity.kpi' });
  const s = await getSweepStatus();

  const dash = '—';
  // Variant B is settled (2026-09-02): show the numbers the frozen scorer read
  // at the floor, not the endpoint's in-image recount, which lags a deploy
  // behind. Open positions stay live -- the recorder keeps logging them.
  const settledB = SWEEP_SETTLED.B === 'FAIL' ? SWEEP_B_VERDICT : null;
  const g = settledB ? { ...s?.gate, ...settledB } : s?.gate;
  const live = s?.gate;
  const gate = g ? `${g.n_closed}/${g.floor}` : dash;
  const meanR = g?.mean_r != null ? `${g.mean_r >= 0 ? '+' : ''}${g.mean_r.toFixed(3)}` : dash;
  const ciLow = g?.ci_low != null ? `${g.ci_low >= 0 ? '+' : ''}${g.ci_low.toFixed(3)}` : dash;
  const wr = g?.wr_pct != null ? `${g.wr_pct.toFixed(1)}%` : dash;
  const open = live ? `${live.n_open}` : dash;
  const status = !g
    ? t('unavailable')
    : settledB || g.status === 'FAIL'
      ? t('fail')
      : g.status === 'PASS'
        ? t('pass')
        : t('accumulating');
  const gateNote = settledB
    ? t('verdictNote', { date: settledB.date })
    : s?.asof_utc
      ? `UTC ${s.asof_utc}`
      : null;

  return (
    <StatCardGrid>
      <StatCard label={t('gate')} value={gate} note={gateNote} />
      <StatCard label={t('meanR')} value={meanR} />
      <StatCard label={t('ciLow')} value={ciLow} />
      <StatCard label={t('wr')} value={wr} />
      <StatCard label={t('open')} value={open} />
      <StatCard label={t('status')} value={status} />
    </StatCardGrid>
  );
}
