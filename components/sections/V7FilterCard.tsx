import { getTranslations } from 'next-intl/server';
import type { SweepStatus } from '@/lib/sweepStatus';

// The V7 structural-filter research surfaced on the site: the three
// verified conditions (static research stats) plus the live adoption
// trigger countdown fed by the weekly veto clock. Display-only — entry
// rules do not move until the trigger fires and the operator picks a tier.
export async function V7FilterCard({
  locale,
  sweep,
}: {
  locale: string;
  sweep: SweepStatus | null;
}) {
  const t = await getTranslations({ locale, namespace: 'v7Filters' });
  const f = sweep?.v7_filters ?? null;
  return (
    <div className="mt-3 rounded-xl border border-white/[0.08] bg-ink/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-iris-violet/80">
          {t('title')}
        </span>
        {f?.asof_utc && (
          <span className="font-body text-[11px] text-mist/45">UTC {f.asof_utc}</span>
        )}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            [t('c1'), t('c1stat'), false],
            [t('c2'), t('c2stat'), false],
            [t('c3'), t('c3stat'), false],
            [t('c4'), t('c4stat'), true],
          ] as const
        ).map(([name, stat, queued]) => (
          <div
            key={name}
            className={`rounded-lg border bg-white/[0.02] px-3.5 py-3 ${
              queued ? 'border-dashed border-white/[0.12]' : 'border-white/[0.07]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-body text-xs text-mist">{name}</div>
              {queued && (
                <span className="shrink-0 rounded border border-[#f0b90b]/30 px-1.5 py-px font-body text-[9px] uppercase tracking-wider text-[#f0b90b]/80">
                  {t('c4tag')}
                </span>
              )}
            </div>
            <div className="mt-1 font-body text-[11px] text-mist/50">{stat}</div>
          </div>
        ))}
      </div>
      {f && (
        <div className="mt-3">
          <div className="font-body text-[10px] uppercase tracking-[0.16em] text-mist/40">
            {t('clocksTitle')}
          </div>
          {(
            [
              ['strong', t('clockStrong'), f.clocks?.strong] as const,
              ['moderate', t('clockModerate'), f.clocks?.moderate] as const,
            ]
          ).map(([key, label, c]) => {
            const clock =
              c ??
              (key === 'strong'
                ? {
                    // legacy payload shape (no clocks map): no fired count
                    since_trigger: f.strong_since_trigger,
                    since_trigger_fired: undefined as number | undefined,
                    trigger_target: f.trigger_target,
                    gap_pp: f.gap_pp,
                    gap_threshold_pp: f.gap_threshold_pp,
                  }
                : null);
            if (!clock) return null;
            const width = Math.min(
              100,
              (clock.since_trigger / clock.trigger_target) * 100,
            );
            // 已開火但還沒回填的尾巴。門檻只認 since_trigger（證據），這裡純呈現：
            // 訊號開火後要等 ~4h 才結算，主數字在那段時間完全不動，操作者兩次
            // （2026-08-02、2026-08-05）都以為訊號沒被記錄到。淡色延伸段讓
            // 「管線裡有東西」看得見，而不用去讀一行灰字。
            const firedN = Math.max(
              clock.since_trigger,
              clock.since_trigger_fired ?? clock.since_trigger,
            );
            const widthFired = Math.min(
              100,
              (firedN / clock.trigger_target) * 100,
            );
            const gapOk = (clock.gap_pp ?? 0) >= clock.gap_threshold_pp;
            return (
              <div key={key} className="mt-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 font-body text-[11px] text-mist/55">
                  <span>{label}</span>
                  <span className={gapOk ? 'text-[#00ffa3]' : 'text-mist/45'}>
                    {t('clockRow', {
                      n: clock.since_trigger,
                      target: clock.trigger_target,
                      gap: clock.gap_pp != null ? clock.gap_pp.toFixed(1) : '—',
                      thr: clock.gap_threshold_pp.toFixed(0),
                    })}
                    {/* A signal's outcome backfills ~4h after its bar, so
                        the evidence count cannot move immediately. Showing
                        the fired-but-unresolved tail keeps a just-printed
                        signal visible instead of leaving the board looking
                        stuck (operator, 2026-08-02). */}
                    {firedN > clock.since_trigger && (
                      <span className="text-amber-300/80">
                        {' '}
                        {t('clockPending', {
                          p: firedN - clock.since_trigger,
                        })}
                      </span>
                    )}
                  </span>
                </div>
                <div className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  {/* 淡色底段 = 已開火（含待結算）；實心段 = 已結算證據。
                      扳機門檻只看實心段。 */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-amber-300/25"
                    style={{ width: `${widthFired}%` }}
                  />
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      key === 'strong' ? 'bg-iris-cyan/70' : 'bg-iris-violet/60'
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="mt-2 font-body text-[10px] leading-relaxed text-mist/35">
            {t('clockNote')}
          </p>
        </div>
      )}
      <p className="mt-3 font-body text-[11px] leading-relaxed text-mist/45">{t('note')}</p>
      <p className="mt-1.5 font-body text-[11px] leading-relaxed text-mist/35">{t('campaign')}</p>
    </div>
  );
}
