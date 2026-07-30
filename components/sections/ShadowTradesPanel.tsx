import { getTranslations } from 'next-intl/server';
import type { SweepStatus } from '@/lib/sweepStatus';

// Recent closed shadow trades across the 29-symbol basket — the sweep
// strategy's "fills table". netR is R-multiples net of scenario-A costs.
export async function ShadowTradesPanel({
  locale,
  sweep,
}: {
  locale: string;
  sweep: SweepStatus | null;
}) {
  const t = await getTranslations({ locale, namespace: 'dashboardPage.shadowPanel' });
  const kinds = t.raw('kinds') as Record<string, string>;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-ink/70 p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <div className="font-body text-xs uppercase tracking-[0.25em] text-iris-violet/80">
          {t('title')}
        </div>
        {sweep?.asof_utc && (
          <div className="font-body text-[11px] text-mist/45">UTC {sweep.asof_utc}</div>
        )}
      </div>
      {sweep && sweep.recent.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full font-body text-xs">
            <thead>
              <tr className="text-left text-mist/45">
                <th className="py-1.5 pr-4 font-normal">{t('sym')}</th>
                <th className="py-1.5 pr-4 font-normal">{t('pool')}</th>
                <th className="py-1.5 pr-4 font-normal">{t('time')}</th>
                <th className="py-1.5 pr-4 text-right font-normal">{t('netr')}</th>
                <th className="py-1.5 font-normal">{t('b')}</th>
              </tr>
            </thead>
            <tbody>
              {sweep.recent.map((r, i) => (
                <tr key={i} className="border-t border-white/5 text-mist/75">
                  <td className="py-2 pr-4">{r.symbol}</td>
                  <td className="py-2 pr-4">{kinds[r.kind] ?? r.kind}</td>
                  <td className="py-2 pr-4 tabular-nums">{r.fill_utc}</td>
                  <td
                    className={`py-2 pr-4 text-right tabular-nums ${
                      r.net_r > 0 ? 'text-[#00ffa3]' : 'text-[#ff3860]'
                    }`}
                  >
                    {r.net_r >= 0 ? '+' : ''}
                    {r.net_r.toFixed(3)}
                  </td>
                  <td className="py-2 text-iris-cyan">{r.variant_b ? '✓' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 font-body text-sm text-mist/50">
          {sweep ? t('empty') : t('unavailable')}
        </div>
      )}
    </div>
  );
}
