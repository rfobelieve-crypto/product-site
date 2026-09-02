import type { OpsBoard as OpsBoardData } from '@/lib/ops';

// Operations surface (2026-09-02). Three tables, in the order an operator
// actually asks the questions: is everything running → which artifact is
// closest to stale → what did the periodic checks decide.
//
// The design rule that matters: health is derived from ARTIFACT AGE, and
// the page says so out loud. A green "scheduled" light is precisely what
// hid a 96-day outage and a 29-hour one; publishing the artifact age
// instead is the whole point of the surface.
//
// Failed and refused verdicts are listed with the passes. A record that
// only shows PASS is not a record.

const COPY = {
  zh: {
    title: '排程與複驗紀錄',
    lede: '每一項定期檢查、它的產物年齡、以及每一次複驗的判決。',
    jobsTitle: '排程作業',
    job: '作業',
    cadence: '頻率',
    health: '狀態',
    age: '產物年齡',
    what: '內容',
    freshTitle: '產物新鮮度',
    artifact: '產物',
    limit: '上限',
    revalTitle: '模型月度複驗',
    date: '日期',
    verdict: '判決',
    ok: '正常',
    bad: '異常',
    unknown: '—',
    stale: '資料過期而拒判',
    pushFail: '推送失敗',
    hours: '小時',
    noneRed: '目前無異常',
    redCount: (n: number) => `${n} 項異常`,
  },
  en: {
    title: 'Schedule & revalidation record',
    lede: 'Every periodic check, the age of what it produces, and every verdict it reached.',
    jobsTitle: 'Scheduled jobs',
    job: 'Job',
    cadence: 'Cadence',
    health: 'State',
    age: 'Artifact age',
    what: 'Does',
    freshTitle: 'Artifact freshness',
    artifact: 'Artifact',
    limit: 'Limit',
    revalTitle: 'Monthly model revalidation',
    date: 'Date',
    verdict: 'Verdict',
    ok: 'ok',
    bad: 'stale',
    unknown: '—',
    stale: 'refused — stale data',
    pushFail: 'push failed',
    hours: 'h',
    noneRed: 'nothing stale',
    redCount: (n: number) => `${n} stale`,
  },
} as const;

function fmtAge(h: number | null | undefined, unit: string) {
  if (h == null) return '—';
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 72) return `${h.toFixed(1)}${unit}`;
  return `${(h / 24).toFixed(0)}d`;
}

export function OpsBoard({
  board,
  locale,
}: {
  board: OpsBoardData | null;
  locale: string;
}) {
  if (!board) return null;
  const c = COPY[locale === 'zh' ? 'zh' : 'en'];
  const reds = board.freshness?.reds ?? [];
  // closest-to-stale first: the row an operator should look at is the one
  // with the least headroom, not the alphabetically first one
  const rows = [...(board.freshness?.rows ?? [])].sort((a, b) => {
    const ra = a.age_h == null ? Infinity : a.age_h / a.max_h;
    const rb = b.age_h == null ? Infinity : b.age_h / b.max_h;
    return rb - ra;
  });

  return (
    <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-light">{c.title}</h2>
        <span
          className={
            reds.length
              ? 'font-body text-xs text-rose-300/70'
              : 'font-body text-xs text-emerald-300/60'
          }
        >
          {reds.length ? c.redCount(reds.length) : c.noneRed}
        </span>
      </div>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-mist/55">
        {c.lede}
      </p>

      {/* jobs */}
      <div className="mt-8 rounded-xl border border-white/[0.08] bg-ink/70 p-5">
        <h3 className="font-body text-[11px] uppercase tracking-[0.2em] text-iris-violet/80">
          {c.jobsTitle}
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse font-body text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-mist/40">
                <th className="pb-2 text-left font-normal">{c.job}</th>
                <th className="pb-2 text-left font-normal">{c.cadence}</th>
                <th className="pb-2 text-right font-normal">{c.health}</th>
                <th className="pb-2 text-right font-normal">{c.age}</th>
              </tr>
            </thead>
            <tbody>
              {board.jobs.map((j) => (
                <tr key={j.id} className="border-t border-white/[0.05] align-top">
                  <td className="py-2.5 pr-3 text-left">
                    <div className="text-mist">{j.name}</div>
                    <div className="mt-1 text-xs leading-relaxed text-mist/40">
                      {j.what}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-left text-mist/60">{j.cadence}</td>
                  <td className="py-2.5 text-right">
                    {j.healthy === true ? (
                      <span className="text-emerald-300/70">{c.ok}</span>
                    ) : j.healthy === false ? (
                      <span className="text-rose-300/70">{c.bad}</span>
                    ) : (
                      <span className="text-mist/30">{c.unknown}</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-mist/60">
                    {fmtAge(j.artifact_age_h, c.hours)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* freshness */}
      <div className="mt-6 rounded-xl border border-white/[0.08] bg-ink/70 p-5">
        <h3 className="font-body text-[11px] uppercase tracking-[0.2em] text-iris-violet/80">
          {c.freshTitle}
        </h3>
        <div className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {rows.map((r) => (
            <div
              key={r.name}
              className="flex items-baseline justify-between gap-3 border-b border-white/[0.04] py-1 font-body text-xs"
            >
              <span className={r.ok ? 'text-mist/55' : 'text-rose-300/80'}>
                {r.name}
              </span>
              <span className="shrink-0 tabular-nums text-mist/35">
                {fmtAge(r.age_h, c.hours)}
                <span className="text-mist/20"> / {fmtAge(r.max_h, c.hours)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* revalidation history */}
      <div className="mt-6 rounded-xl border border-white/[0.08] bg-ink/70 p-5">
        <h3 className="font-body text-[11px] uppercase tracking-[0.2em] text-iris-violet/80">
          {c.revalTitle}
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse font-body text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-mist/40">
                <th className="pb-2 text-left font-normal">{c.date}</th>
                <th className="pb-2 text-left font-normal">{c.verdict}</th>
                <th className="pb-2 text-right font-normal">AUC</th>
                <th className="pb-2 text-right font-normal">IC</th>
                <th className="pb-2 text-right font-normal">SNR</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {board.revalidations.map((r) => (
                <tr key={r.date} className="border-t border-white/[0.05]">
                  <td className="py-2 text-left text-mist/70">{r.date}</td>
                  <td className="py-2 text-left">
                    <span
                      className={
                        r.verdict === 'PASS'
                          ? 'text-emerald-300/70'
                          : r.verdict.startsWith('STALE')
                            ? 'text-amber-300/70'
                            : 'text-rose-300/70'
                      }
                    >
                      {r.verdict}
                    </span>
                    {r.stale_guard_hit && (
                      <span className="ml-2 text-[10px] text-amber-300/50">
                        {c.stale}
                      </span>
                    )}
                    {r.push_failed && (
                      <span className="ml-2 text-[10px] text-rose-300/50">
                        {c.pushFail}
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right text-mist/60">
                    {r.auc?.toFixed(4) ?? '—'}
                  </td>
                  <td className="py-2 text-right text-mist/60">
                    {r.ic != null ? (r.ic > 0 ? '+' : '') + r.ic.toFixed(4) : '—'}
                  </td>
                  <td className="py-2 text-right text-mist/60">
                    {r.snr_spearman_pct != null
                      ? `${r.snr_spearman_pct.toFixed(3)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-5 max-w-2xl font-body text-xs leading-relaxed text-mist/40">
        {board.principle}
      </p>
      {board.asof_utc && (
        <p className="mt-3 font-body text-[10px] uppercase tracking-[0.15em] text-mist/25">
          asof {board.asof_utc} UTC
        </p>
      )}
    </section>
  );
}
