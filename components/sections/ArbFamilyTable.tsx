import type { ArbPair, ArbSide, ArbStatus } from '@/lib/arb';

// §0.75 family table (2026-09-01). Seven recorders were running while the
// page showed one progress bar, so from outside the site six of them did
// not exist.
//
// Deliberate choices, each one a discipline the research side already pays
// for and the page must not quietly undo:
//   * No dollars anywhere — the writer strips them; depth survives as a
//     tier because "fat band, thin book" is the honest caveat.
//   * The CONTROL pair is labelled as such. BTC is expected to show
//     nothing; if it ever looks good the instrument is broken, not the
//     market. Hiding it would turn the family into a menu of winners.
//   * Carry is shown in its own column and marked as report-only: the
//     frozen gate is about the price spread and is not amended after the
//     fact because a second payoff turned up.

const COPY = {
  zh: {
    title: '錄製家族',
    sub: '同一套凍結判準，全部報告——不挑好看的',
    pair: '配對',
    progress: '進度',
    band: '價差帶',
    fires: '出手/天',
    converge: '會收斂',
    depth: '盤口',
    carry: '資金費率',
    afterFee: '扣費後',
    needBand: '需要',
    zeroFee: '零費對照',
    unverified: '費率未查證',
    control: '對照組',
    reportOnly: '報告用',
    yes: '是',
    no: '否',
    pending: '待觀察',
    thin: '薄',
    moderate: '中',
    deep: '厚',
    perYear: '/年',
    noData: '尚無資料',
    days: '天',
  },
  en: {
    title: 'Recording family',
    sub: 'One frozen gate, all pairs reported — no cherry-picking',
    pair: 'Pair',
    progress: 'Progress',
    band: 'Band',
    fires: 'Fires/day',
    converge: 'Converges',
    depth: 'Book',
    carry: 'Funding',
    afterFee: 'After fees',
    needBand: 'need',
    zeroFee: 'zero-fee control',
    unverified: 'fee unverified',
    control: 'control',
    reportOnly: 'report only',
    yes: 'yes',
    no: 'no',
    pending: 'pending',
    thin: 'thin',
    moderate: 'mid',
    deep: 'deep',
    perYear: '/yr',
    noData: 'no data yet',
    days: 'd',
  },
} as const;

function bestSide(p: ArbPair): ArbSide | null {
  const s = p.sell;
  const b = p.buy;
  if (!s) return b;
  if (!b) return s;
  // the side a reader would look at first: the one that actually converges,
  // then the wider band. A non-converging band is not an opportunity.
  if (s.converges && !b.converges) return s;
  if (b.converges && !s.converges) return b;
  return (s.band_bps ?? 0) >= (b.band_bps ?? 0) ? s : b;
}

export function ArbFamilyTable({
  status,
  locale,
}: {
  status: ArbStatus | null;
  locale: string;
}) {
  if (!status || status.pairs.length === 0) return null;
  const c = COPY[locale === 'zh' ? 'zh' : 'en'];

  return (
    <div className="mt-6 rounded-xl border border-white/[0.08] bg-ink/70 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-body text-[11px] uppercase tracking-[0.2em] text-iris-violet/80">
          {c.title}
        </h2>
        <span className="font-body text-[11px] text-mist/45">{c.sub}</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse font-body text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.15em] text-mist/40">
              <th className="pb-2 text-left font-normal">{c.pair}</th>
              <th className="pb-2 text-right font-normal">{c.progress}</th>
              <th className="pb-2 text-right font-normal">{c.band}</th>
              <th className="pb-2 text-right font-normal">{c.afterFee}</th>
              <th className="pb-2 text-right font-normal">{c.fires}</th>
              <th className="pb-2 text-right font-normal">{c.converge}</th>
              <th className="pb-2 text-right font-normal">{c.depth}</th>
              <th className="pb-2 text-right font-normal">
                {c.carry} <span className="text-mist/25">({c.reportOnly})</span>
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {status.pairs.map((p) => {
              const s = bestSide(p);
              const depthLabel =
                s?.depth_tier === 'thin'
                  ? c.thin
                  : s?.depth_tier === 'moderate'
                    ? c.moderate
                    : s?.depth_tier === 'deep'
                      ? c.deep
                      : '—';
              return (
                <tr
                  key={p.pair}
                  className="border-t border-white/[0.05] text-mist/70"
                >
                  <td className="py-2 text-left">
                    <span className={p.is_control ? 'text-mist/45' : 'text-mist'}>
                      {p.pair}
                    </span>
                    {p.is_control && (
                      <span className="ml-2 rounded border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] text-mist/40">
                        {c.control}
                      </span>
                    )}
                    {p.zero_fee && (
                      <span className="ml-2 rounded border border-emerald-400/20 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] text-emerald-300/60">
                        {c.zeroFee}
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {p.days?.toFixed(1) ?? '—'}
                    <span className="text-mist/35">
                      /{p.gate_days ?? 7}
                      {c.days}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    {s?.band_bps != null ? `${s.band_bps.toFixed(2)} bps` : '—'}
                  </td>
                  <td
                    className="py-2 text-right"
                    title={
                      s?.required_band_bps != null
                        ? `${c.needBand} ${s.required_band_bps.toFixed(1)} bps`
                        : undefined
                    }
                  >
                    {s?.net_bps_per_trade != null ? (
                      <span
                        className={
                          s.fee_ok ? 'text-emerald-300/70' : 'text-rose-300/60'
                        }
                      >
                        {s.net_bps_per_trade > 0 ? '+' : ''}
                        {s.net_bps_per_trade.toFixed(1)}
                      </span>
                    ) : (
                      '—'
                    )}
                    {s?.fee_unverified && s.fee_unverified.length > 0 && (
                      <span
                        className="ml-1 text-[9px] text-amber-300/60"
                        title={`${c.unverified}: ${s.fee_unverified.join(',')}`}
                      >
                        ?
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {s?.fires_per_day != null ? s.fires_per_day.toFixed(0) : '—'}
                  </td>
                  <td className="py-2 text-right">
                    {s?.converges === true ? (
                      <span className="text-emerald-300/70">{c.yes}</span>
                    ) : s?.converges === false ? (
                      <span className="text-rose-300/60">{c.no}</span>
                    ) : (
                      <span className="text-mist/35">{c.pending}</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-mist/55">{depthLabel}</td>
                  <td className="py-2 text-right">
                    {p.carry?.annualised_pct != null ? (
                      <span
                        className={
                          p.carry.annualised_pct > 0
                            ? 'text-emerald-300/70'
                            : 'text-rose-300/60'
                        }
                      >
                        {p.carry.annualised_pct > 0 ? '+' : ''}
                        {p.carry.annualised_pct.toFixed(1)}%{c.perYear}
                      </span>
                    ) : (
                      <span className="text-mist/30">{c.noData}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-body text-xs leading-relaxed text-mist/45">
        {status.principle}
      </p>
      <p className="mt-2 font-body text-xs leading-relaxed text-mist/35">
        {status.carry_note}
      </p>
      {status.fee_note && (
        <p className="mt-2 font-body text-xs leading-relaxed text-amber-200/50">
          {status.fee_note}
        </p>
      )}
      {status.asof_utc && (
        <p className="mt-3 font-body text-[10px] uppercase tracking-[0.15em] text-mist/25">
          asof {status.asof_utc} UTC
        </p>
      )}
    </div>
  );
}
