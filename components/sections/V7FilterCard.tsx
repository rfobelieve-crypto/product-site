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
  const pct = f ? Math.min(100, (f.strong_since_trigger / f.trigger_target) * 100) : 0;
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
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {(
          [
            [t('c1'), t('c1stat')],
            [t('c2'), t('c2stat')],
            [t('c3'), t('c3stat')],
          ] as const
        ).map(([name, stat]) => (
          <div key={name} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
            <div className="font-body text-xs text-mist">{name}</div>
            <div className="mt-1 font-body text-[11px] text-mist/50">{stat}</div>
          </div>
        ))}
      </div>
      {f && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between font-body text-[11px] text-mist/55">
            <span>
              {t('trigger', { n: f.strong_since_trigger, target: f.trigger_target })}
            </span>
            <span className={(f.gap_pp ?? 0) >= f.gap_threshold_pp ? 'text-[#00ffa3]' : ''}>
              {t('gap', {
                gap: f.gap_pp != null ? f.gap_pp.toFixed(1) : '—',
                thr: f.gap_threshold_pp.toFixed(0),
              })}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-iris-cyan/70"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
      <p className="mt-3 font-body text-[11px] leading-relaxed text-mist/45">{t('note')}</p>
    </div>
  );
}
