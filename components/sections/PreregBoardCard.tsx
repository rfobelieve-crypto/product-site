import { getPreregBoard, preregProgress, type PreregOpen, type PreregSettled } from '@/lib/prereg';

// Pre-registration board (2026-08-26). Every open hypothesis, what it
// claims, and how far its clock has run — plus the ones already settled,
// including the negative results.
//
// Why this card exists: the research discipline was invisible from outside.
// Five clocks were accumulating, each observable only by running a script,
// so the honest state ("nothing decided yet, here is exactly how far") read
// from the outside as "nothing happening".
//
// Two rules this card follows and must keep following:
//  1. PROGRESS, NOT VERDICTS. Each verdict has one owning scorer on the
//     research side. Rendering a win rate or mean-R here would create a
//     second number that can disagree with the deciding one.
//  2. 研究結論上牆必標狀態 (CLAUDE.md public-surface rule). Open items are
//     dashed + amber; settled ones carry their verdict word, negative
//     results included — a board that only shows survivors is a lie about
//     the process.
//
// Labels ship inline rather than through messages JSON: see the 2026-08-01
// i18n surgery incident. Server component, same degrade contract as the
// KPI rows — an outage renders one muted line, never an error.
const L = {
  zh: {
    title: '研究進度看板',
    subtitle: '每一條還沒判決的假設，以及它的時鐘走到哪',
    open: '累積中',
    settled: '已判決',
    unavailable: '資料暫不可用',
    updated: '更新',
    registered: '凍結於',
    signals: '筆',
    days: '天',
    gateBoth: '兩個條件都要滿足才判決',
    principleLabel: '什麼是預註冊',
  },
  en: {
    title: 'Research Progress',
    subtitle: 'Every undecided hypothesis and how far its clock has run',
    open: 'accumulating',
    settled: 'settled',
    unavailable: 'temporarily unavailable',
    updated: 'updated',
    registered: 'frozen',
    signals: '',
    days: 'd',
    gateBoth: 'both conditions must be met before a verdict',
    principleLabel: 'What pre-registration means',
  },
} as const;

const TONE: Record<PreregSettled['tone'], string> = {
  ok: 'border-iris-cyan/40 text-iris-cyan/90',
  warn: 'border-amber-400/40 text-amber-300/90',
  dead: 'border-white/[0.14] text-mist/45',
};

function Clock({ c, t }: { c: PreregOpen; t: (typeof L)['zh'] | (typeof L)['en'] }) {
  const pct = preregProgress(c) * 100;
  // Both legs are shown separately whenever both exist: a single merged bar
  // hides WHICH constraint is binding, and that is the operationally useful
  // half of the answer.
  const legs: string[] = [];
  if (c.gate_n != null && c.n != null) legs.push(`${c.n} / ${c.gate_n}${t.signals}`);
  if (c.gate_days != null) legs.push(`${c.days.toFixed(1)} / ${c.gate_days}${t.days}`);

  return (
    <div className="rounded-lg border border-dashed border-amber-400/25 bg-white/[0.02] px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <div className="font-body text-[10px] uppercase tracking-[0.14em] text-mist/45">
          {c.line} · §{c.id}
        </div>
        <span className="rounded-full border border-amber-400/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-amber-300/90">
          {t.open}
        </span>
      </div>
      <div className="mt-1.5 font-display text-base font-light leading-snug tracking-tight text-mist">
        {c.title}
      </div>
      <p className="mt-1 font-body text-[11.5px] leading-relaxed text-mist/55">{c.hypothesis}</p>

      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-amber-400/60"
          style={{ width: `${Math.max(1.5, pct)}%` }}
        />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-body text-[11px] tabular-nums text-mist/45">
        {legs.map((l) => (
          <span key={l}>{l}</span>
        ))}
        <span className="text-mist/30">
          {t.registered} {c.registered}
        </span>
      </div>
      {legs.length > 1 ? (
        <div className="mt-0.5 font-body text-[10px] text-mist/30">{t.gateBoth}</div>
      ) : null}
      <p className="mt-1.5 font-body text-[11px] leading-relaxed text-mist/35">{c.note}</p>
    </div>
  );
}

export async function PreregBoardCard({ locale }: { locale: string }) {
  const t = locale === 'zh' ? L.zh : L.en;
  const b = await getPreregBoard();

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-light text-mist">{t.title}</h3>
          <p className="mt-0.5 font-body text-[11px] text-mist/45">{t.subtitle}</p>
        </div>
        {b?.asof_utc ? (
          <span className="font-body text-[10px] uppercase tracking-[0.14em] text-mist/35">
            {t.updated} UTC {b.asof_utc}
          </span>
        ) : null}
      </div>

      {!b ? (
        <div className="mt-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-4 font-body text-[12px] text-mist/40">
          {t.unavailable}
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {b.open.map((c) => (
              <Clock key={c.id} c={c} t={t} />
            ))}
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-body text-[10px] uppercase tracking-[0.14em] text-mist/35">
              {t.settled}
            </span>
            <span className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {b.settled.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                  <div className="font-body text-[10px] uppercase tracking-[0.14em] text-mist/45">
                    {s.line} · §{s.id}
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] ${TONE[s.tone]}`}
                  >
                    {s.verdict}
                  </span>
                </div>
                <div className="mt-1.5 font-display text-sm font-light leading-snug text-mist/90">
                  {s.title}
                </div>
                <p className="mt-1 font-body text-[11.5px] leading-relaxed text-mist/50">{s.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 font-body text-[11px] leading-relaxed text-mist/35">
            <span className="text-mist/50">{t.principleLabel}：</span> {b.principle}
          </p>
        </>
      )}
    </div>
  );
}
