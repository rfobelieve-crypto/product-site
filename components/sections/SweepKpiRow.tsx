import { getTranslations } from 'next-intl/server';
import { getSweepStatus } from '@/lib/sweepStatus';
import { StatCard, StatCardGrid } from '@/components/sections/StatCard';

// Server component, same degrade contract as V7KpiRow: a status outage
// renders dashes, never an error. Numbers are the Variant B gate stats the
// shadow recorder itself reports (indicator/agent /public/sweep-status).
export async function SweepKpiRow({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'chartsPage.liquidity.kpi' });
  const s = await getSweepStatus();

  const dash = '—';
  const g = s?.gate;
  const gate = g ? `${g.n_closed}/${g.floor}` : dash;
  const meanR = g?.mean_r != null ? `${g.mean_r >= 0 ? '+' : ''}${g.mean_r.toFixed(3)}` : dash;
  const ciLow = g?.ci_low != null ? `${g.ci_low >= 0 ? '+' : ''}${g.ci_low.toFixed(3)}` : dash;
  const wr = g?.wr_pct != null ? `${g.wr_pct.toFixed(0)}%` : dash;
  const open = g ? `${g.n_open}` : dash;
  const status = !g
    ? t('unavailable')
    : g.status === 'PASS'
      ? t('pass')
      : t('accumulating');

  return (
    <StatCardGrid>
      <StatCard label={t('gate')} value={gate} note={s?.asof_utc ? `UTC ${s.asof_utc}` : null} />
      <StatCard label={t('meanR')} value={meanR} />
      <StatCard label={t('ciLow')} value={ciLow} />
      <StatCard label={t('wr')} value={wr} />
      <StatCard label={t('open')} value={open} />
      <StatCard label={t('status')} value={status} />
    </StatCardGrid>
  );
}
