import type { ArbScan, ArbScanRow, ArbStatus } from '@/lib/arb';

// §1.00 battlefield board (2026-09-03). The operator's framing: "I have one
// weapon, I keep having to find where the battlefield is." The recording
// family is the weapon (frozen gate, seven pairs); this board is the search.
//
// Three things it must never become:
//   * a P&L board — nothing here has been traded, and the ladder at the
//     bottom says so out loud, step by step
//   * a dollar board — the ranking metric (capturable USD/day) is stripped
//     on the research side; depth arrives as a tier, money never crosses
//   * a verdict board — a fat band that never converges is the most
//     seductive way for this line to lose money, and the control pair
//     (BTC) exists precisely to show what that looks like
const COPY = {
  zh: {
    title: '戰場掃描',
    sub: '武器固定，戰場要一直找——這是搜尋盤，不是損益盤',
    pair: '配對',
    cls: '類別',
    band: '價差帶',
    vsControl: '對照倍數',
    fires: '出手/天',
    depth: '盤口',
    samples: '樣本',
    stage: '階段',
    need: '需要帶',
    net: '每筆淨',
    feeTitle: '你的費率（決定哪些戰場活著）',
    feeVenue: '場館',
    feeTaker: '吃單',
    feeRebate: '返佣',
    feeEff: '實際',
    feeUnverified: '待查證',
    feeKilled: '費率吃光',
    coverage: '涵蓋',
    pairsWord: '配對',
    quotes: '報價',
    spanDays: '天',
    control: '對照組雜訊底',
    pending: '累積中（樣本未達門檻，不列入）',
    ladderTitle: '離「真的賺到」還有幾關',
    thin: '薄',
    moderate: '中',
    deep: '厚',
    notDistinguishable: '與買賣價差無法區分',
  },
  en: {
    title: 'Battlefield scan',
    sub: 'The weapon is fixed; the battlefield must be found — a search board, not a P&L board',
    pair: 'Pair',
    cls: 'Class',
    band: 'Band',
    vsControl: 'x control',
    fires: 'Fires/day',
    depth: 'Book',
    samples: 'Samples',
    stage: 'Stage',
    need: 'Needs',
    net: 'Net/trade',
    feeTitle: 'Your fees (they decide which battlefields survive)',
    feeVenue: 'Venue',
    feeTaker: 'Taker',
    feeRebate: 'Rebate',
    feeEff: 'Effective',
    feeUnverified: 'unverified',
    feeKilled: 'eaten by fees',
    coverage: 'Coverage',
    pairsWord: 'pairs',
    quotes: 'quotes',
    spanDays: 'd',
    control: 'control noise floor',
    pending: 'still counting (below sample threshold, not listed)',
    ladderTitle: 'Steps still between this and money',
    thin: 'thin',
    moderate: 'mid',
    deep: 'deep',
    notDistinguishable: 'not distinguishable from spread',
  },
} as const;

const CLASS_TONE: Record<string, string> = {
  商品: 'text-amber-300/70',
  指數: 'text-sky-300/70',
  外匯: 'text-violet-300/70',
  利率: 'text-teal-300/70',
  股票: 'text-mist/70',
  加密: 'text-mist/40',
};

function depthLabel(
  row: ArbScanRow,
  c: (typeof COPY)['zh'] | (typeof COPY)['en'],
) {
  if (row.depth_tier === 'thin') return c.thin;
  if (row.depth_tier === 'moderate') return c.moderate;
  if (row.depth_tier === 'deep') return c.deep;
  return '—';
}

export function ArbScanBoard({
  status,
  locale,
}: {
  status: ArbStatus | null;
  locale: string;
}) {
  const scan: ArbScan | null | undefined = status?.scan;
  if (!scan || !scan.rows?.length) return null;
  const c = COPY[locale === 'zh' ? 'zh' : 'en'];

  return (
    <div className="mt-6 rounded-xl border border-white/[0.08] bg-ink/70 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-body text-[11px] uppercase tracking-[0.2em] text-iris-violet/80">
          {c.title}
        </h2>
        <span className="font-body text-[11px] text-mist/45">{c.sub}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-body text-[11px] text-mist/45">
        <span>
          {c.coverage}: <span className="tabular-nums text-mist/70">{scan.pairs ?? '—'}</span>{' '}
          {c.pairsWord}
        </span>
        <span className="tabular-nums">
          {scan.quotes?.toLocaleString() ?? '—'} {c.quotes}
        </span>
        <span className="tabular-nums">
          {scan.span_days != null ? `${scan.span_days.toFixed(1)}${c.spanDays}` : '—'}
        </span>
        {scan.control_band_bps != null && (
          <span className="tabular-nums">
            {c.control}: {scan.control_band_bps.toFixed(2)} bps
          </span>
        )}
        {scan.pending_pairs != null && scan.pending_pairs > 0 && (
          <span className="tabular-nums text-amber-300/45">
            {scan.pending_pairs.toLocaleString()} {c.pending}
          </span>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse font-body text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.15em] text-mist/40">
              <th className="pb-2 text-left font-normal">{c.pair}</th>
              <th className="pb-2 text-left font-normal">{c.cls}</th>
              <th className="pb-2 text-right font-normal">{c.band}</th>
              <th className="pb-2 text-right font-normal">{c.need}</th>
              <th className="pb-2 text-right font-normal">{c.net}</th>
              <th className="pb-2 text-right font-normal">{c.vsControl}</th>
              <th className="pb-2 text-right font-normal">{c.fires}</th>
              <th className="pb-2 text-right font-normal">{c.depth}</th>
              <th className="pb-2 text-right font-normal">{c.samples}</th>
              <th className="pb-2 text-right font-normal">{c.stage}</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {scan.rows.map((r) => {
              // A band inside 2x the control pair's band is the instrument's
              // own noise, not an opportunity — say so rather than ranking it.
              const noise = r.band_vs_control != null && r.band_vs_control <= 2;
              return (
                <tr key={r.pair} className="border-t border-white/[0.05] text-mist/70">
                  <td className="py-2 text-left text-mist">{r.pair}</td>
                  <td className="py-2 text-left">
                    <span className={CLASS_TONE[r.asset_class] ?? 'text-mist/50'}>
                      {r.asset_class}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    {r.band_bps != null ? `${r.band_bps.toFixed(2)} bps` : '—'}
                  </td>
                  <td className="py-2 text-right text-mist/45">
                    {r.required_band_bps != null
                      ? r.required_band_bps.toFixed(1)
                      : '—'}
                  </td>
                  <td
                    className={`py-2 text-right ${
                      r.fee_ok ? 'text-emerald-300/70' : 'text-rose-300/50'
                    }`}
                    title={r.fee_ok ? undefined : c.feeKilled}
                  >
                    {r.net_per_trade_bps != null
                      ? `${r.net_per_trade_bps > 0 ? '+' : ''}${r.net_per_trade_bps.toFixed(2)}`
                      : '—'}
                    {r.fee_unverified?.length > 0 && (
                      <span className="ml-1 text-[9px] text-amber-300/50">*</span>
                    )}
                  </td>
                  <td
                    className={`py-2 text-right ${noise ? 'text-mist/30' : 'text-mist/70'}`}
                    title={noise ? c.notDistinguishable : undefined}
                  >
                    {r.band_vs_control != null ? `${r.band_vs_control.toFixed(1)}x` : '—'}
                  </td>
                  <td className="py-2 text-right">
                    {r.fires_per_day != null ? r.fires_per_day.toFixed(0) : '—'}
                  </td>
                  <td className="py-2 text-right text-mist/55">{depthLabel(r, c)}</td>
                  <td className="py-2 text-right text-mist/45">{r.samples ?? '—'}</td>
                  <td className="py-2 text-right">
                    <span
                      className={
                        r.stage === '升格候選'
                          ? 'text-emerald-300/70'
                          : r.stage === '資料未滿'
                            ? 'text-mist/35'
                            : 'text-mist/55'
                      }
                    >
                      {r.stage}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {scan.fees && scan.fees.length > 0 && (
        <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <h3 className="font-body text-[10px] uppercase tracking-[0.2em] text-mist/40">
            {c.feeTitle}
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse font-body text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.15em] text-mist/35">
                  <th className="pb-1 text-left font-normal">{c.feeVenue}</th>
                  <th className="pb-1 text-right font-normal">{c.feeTaker}</th>
                  <th className="pb-1 text-right font-normal">{c.feeRebate}</th>
                  <th className="pb-1 text-right font-normal">{c.feeEff}</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {scan.fees.map((f) => (
                  <tr key={f.venue} className="border-t border-white/[0.04] text-mist/60">
                    <td className="py-1 text-left">
                      {f.venue}
                      {!f.verified && (
                        <span className="ml-2 text-[9px] uppercase tracking-[0.15em] text-amber-300/50">
                          {c.feeUnverified}
                        </span>
                      )}
                    </td>
                    <td className="py-1 text-right">{f.taker_bps.toFixed(2)}</td>
                    <td className="py-1 text-right text-mist/40">
                      {f.rebate_pct > 0 ? `-${f.rebate_pct}%` : '—'}
                    </td>
                    <td className="py-1 text-right text-mist/80">
                      {f.effective_bps.toFixed(2)} bps
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {scan.fee_rule && (
            <p className="mt-3 font-body text-xs leading-relaxed text-mist/45">
              {scan.fee_rule}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        <h3 className="font-body text-[10px] uppercase tracking-[0.2em] text-mist/40">
          {c.ladderTitle}
        </h3>
        <ol className="mt-3 space-y-2">
          {scan.ladder.map((s, i) => (
            <li key={s.step} className="flex gap-3 font-body text-xs leading-relaxed">
              <span className="w-4 shrink-0 tabular-nums text-mist/30">{i + 1}</span>
              <span className="w-24 shrink-0 text-mist/70">{s.step}</span>
              <span
                className={`w-16 shrink-0 ${
                  s.state === '本板'
                    ? 'text-emerald-300/60'
                    : s.state === '下一步'
                      ? 'text-amber-300/60'
                      : 'text-mist/30'
                }`}
              >
                {s.state}
              </span>
              <span className="text-mist/45">{s.means}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-4 font-body text-xs leading-relaxed text-mist/45">{scan.caveat}</p>
      {scan.asof_utc && (
        <p className="mt-3 font-body text-[10px] uppercase tracking-[0.15em] text-mist/25">
          scan asof {scan.asof_utc} UTC
        </p>
      )}
    </div>
  );
}
