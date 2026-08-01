import { getTranslations } from 'next-intl/server';
import type { LedgerRow, SweepStatus } from '@/lib/sweepStatus';

function num(v: number | null | undefined, digits = 3, signed = true): string {
  if (v == null) return '—';
  const s = v.toFixed(digits);
  return signed && v >= 0 ? `+${s}` : s;
}

function LedgerTable({
  rows,
  head,
  cols,
}: {
  rows: LedgerRow[];
  head: string;
  cols: { ledger: string; closed: string; open: string; mean: string; ci: string; wr: string; state: string; accumulating: string };
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
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-white/5 text-mist/75 transition-colors hover:bg-white/[0.03]">
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
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] ${
                    r.status === 'PASS' ? 'border-[#00ffa3]/40 text-[#00ffa3]' : 'border-white/15 text-mist/50'
                  }`}
                >
                  {r.status === 'PASS' ? 'PASS' : cols.accumulating}
                </span>
              </td>
            </tr>
          ))}
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
  };
  const c = sweep.clocks;
  return (
    <section className="mt-6">
      <h2 className="border-l-2 border-iris-cyan/70 pl-3 font-display text-base font-light">
        {t('title')}
      </h2>
      <p className="mt-2 font-body text-[11px] leading-relaxed text-mist/50">{t('intro')}</p>
      <LedgerTable rows={sweep.cohorts} head={t('cohortsHead')} cols={cols} />
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
