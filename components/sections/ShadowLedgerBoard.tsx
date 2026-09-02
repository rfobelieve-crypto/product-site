import { getTranslations } from 'next-intl/server';
import { SWEEP_B_VERDICT, SWEEP_SETTLED } from '@/lib/sweepStatus';
import type { LedgerRow, SweepStatus } from '@/lib/sweepStatus';

function num(v: number | null | undefined, digits = 3, signed = true): string {
  if (v == null) return '—';
  const s = v.toFixed(digits);
  return signed && v >= 0 ? `+${s}` : s;
}

type LedgerCols = {
  ledger: string;
  closed: string;
  open: string;
  mean: string;
  ci: string;
  wr: string;
  state: string;
  accumulating: string;
  fail: string;
  voided: string;
};

// settled: verdicts already read at the frozen floor (SWEEP_SETTLED). They win
// over the live `status` field, which stays 'accumulating' until the recorder
// service redeploys.
function LedgerTable({
  rows,
  head,
  cols,
  settled,
}: {
  rows: LedgerRow[];
  head: string;
  cols: LedgerCols;
  settled?: Record<string, 'FAIL' | 'VOID'>;
}) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-white/[0.08] bg-ink/70">
      <div className="border-b border-white/[0.06] px-4 py-2.5 font-body text-[10px] uppercase tracking-[0.2em] text-iris-violet/80">
        {head}
      </div>
      <table className="w-full font-body text-xs">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wider text-mist/45">
            <th className="px-3 py-2">{cols.ledger}</th>
            <th className="px-3 py-2 text-right">{cols.closed}</th>
            <th className="px-3 py-2 text-right">{cols.open}</th>
            <th className="px-3 py-2 text-right">{cols.mean}</th>
            <th className="px-3 py-2 text-right">{cols.ci}</th>
            <th className="px-3 py-2 text-right">{cols.wr}</th>
            <th className="px-3 py-2">{cols.state}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const state =
              settled?.[r.key] ??
              (r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'ACC');
            const tone =
              state === 'PASS'
                ? 'border-[#00ffa3]/40 text-[#00ffa3]'
                : state === 'FAIL'
                  ? 'border-[#ff3860]/40 text-[#ff3860]'
                  : state === 'VOID'
                    ? 'border-white/12 text-mist/35'
                    : 'border-white/15 text-mist/50';
            const stateLabel =
              state === 'PASS'
                ? 'PASS'
                : state === 'FAIL'
                  ? cols.fail
                  : state === 'VOID'
                    ? cols.voided
                    : cols.accumulating;
            return (
            <tr key={r.key} className={`border-t border-white/5 transition-colors hover:bg-white/[0.03] ${state === 'VOID' ? 'text-mist/40' : 'text-mist/75'}`}>
              <td className="px-3 py-2">
                <span className="font-medium text-mist">{r.key}</span>
                {r.label_zh && <span className="ml-2 text-[11px] text-mist/50">{r.label_zh}</span>}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{r.n_closed}</td>
              <td className="px-3 py-2 text-right tabular-nums text-mist/50">{r.n_open}</td>
              <td className={`px-3 py-2 text-right tabular-nums ${(r.mean_r ?? 0) > 0 ? 'text-[#00ffa3]' : 'text-[#ff3860]'}`}>
                {num(r.mean_r)}
              </td>
              <td className={`px-3 py-2 text-right tabular-nums ${(r.ci_low ?? -1) > 0 ? 'text-[#00ffa3]' : 'text-mist/55'}`}>
                {num(r.ci_low)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{r.wr_pct != null ? `${r.wr_pct.toFixed(0)}%` : '—'}</td>
              <td className="px-3 py-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${tone}`}>{stateLabel}</span>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// The management view the operator asked for: every ledger the hourly
// recorder feeds (variant cohorts + frozen combo watchlist) plus the
// other research clocks — nothing left "only in the database".
export async function ShadowLedgerBoard({
  locale,
  sweep,
}: {
  locale: string;
  sweep: SweepStatus | null;
}) {
  const t = await getTranslations({ locale, namespace: 'ledger' });
  if (!sweep?.cohorts?.length) {
    return <p className="mt-4 font-body text-sm text-mist/50">{t('unavailable')}</p>;
  }
  const cols = {
    ledger: t('cols.ledger'),
    closed: t('cols.closed'),
    open: t('cols.open'),
    mean: t('cols.mean'),
    ci: t('cols.ci'),
    wr: t('cols.wr'),
    state: t('cols.state'),
    accumulating: t('cols.accumulating'),
    fail: t('cols.fail'),
    voided: t('cols.voided'),
  };
  // B's row carries the frozen verdict numbers (the endpoint recomputes it
  // in-image and lags a flow_system deploy); open count stays live.
  const cohorts = sweep.cohorts.map((r) =>
    r.key === 'B' && SWEEP_SETTLED.B === 'FAIL'
      ? {
          ...r,
          n_closed: SWEEP_B_VERDICT.n_closed,
          mean_r: SWEEP_B_VERDICT.mean_r,
          ci_low: SWEEP_B_VERDICT.ci_low,
          wr_pct: SWEEP_B_VERDICT.wr_pct,
        }
      : r,
  );
  const c = sweep.clocks;
  return (
    <section className="mt-6">
      <h2 className="border-l-2 border-iris-cyan/70 pl-3 font-display text-base font-light">
        {t('title')}
      </h2>
      <p className="mt-2 font-body text-[11px] leading-relaxed text-mist/50">{t('intro')}</p>
      <LedgerTable rows={cohorts} head={t('cohortsHead')} cols={cols} settled={SWEEP_SETTLED} />
      <p className="mt-2 font-body text-[11px] leading-relaxed text-mist/50">{t('verdict')}</p>
      {sweep.combos && sweep.combos.length > 0 && (
        <LedgerTable
          rows={sweep.combos}
          head={t('combosHead', { date: sweep.watchlist_registered ?? '' })}
          cols={cols}
        />
      )}
      {c && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              [t('clocks.gateB'), `${c.gate_b_closed} / ${c.gate_b_target}`, t('clocks.gateBNote')],
              [t('clocks.depth'), `${c.depth_days} / ${c.depth_target}d`, t('clocks.depthNote')],
              [t('clocks.tracked'), `${c.tracked_strong}`, t('clocks.trackedNote')],
              [t('clocks.verdict'), c.next_verdict, t('clocks.verdictNote')],
            ] as const
          ).map(([label, value, note]) => (
            <div key={label} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
              <div className="truncate font-body text-[10px] uppercase tracking-[0.14em] text-mist/45">{label}</div>
              <div className="mt-1.5 font-display text-lg font-light tabular-nums">{value}</div>
              <div className="mt-1 truncate font-body text-[11px] text-mist/40">{note}</div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 font-body text-[11px] leading-relaxed text-mist/45">{t('promotion')}</p>
    </section>
  );
}
