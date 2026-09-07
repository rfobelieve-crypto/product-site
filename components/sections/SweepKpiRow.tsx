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
  // 2026-09-07 判決（flow_system research/poc/honest_fill.py）：這條線的
  // 每筆報酬建立在「在價位上被動成交」的假設,而該假設已被推翻——57.9% 的
  // 交易上市場距離價位中位 42.6 bps,那個價格拿不到。用真實可成交價重算
  // +0.0365R -> -0.0483R、0/9 幣為正。
  //
  // 依操作者指示:在用分層表的成交率與 markout 重算完歷史之前,本頁**不提供
  // 任何績效數字**——不是舊值,也不是修正後的猜測值。計數(gate/open)與狀態
  // 是事實不是績效,保留。勝率同樣依賴進場價,一併撤下。
  const RECOMPUTING = t('recomputing');
  const meanR = RECOMPUTING;
  const ciLow = RECOMPUTING;
  const wr = RECOMPUTING;
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
