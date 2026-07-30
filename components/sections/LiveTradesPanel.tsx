import { getTranslations } from 'next-intl/server';
import type { LiveStatus } from '@/lib/liveStatus';

const DIR_STYLE: Record<string, string> = {
  LONG: 'text-[#00ffa3]',
  SHORT: 'text-[#ff3860]',
};

// The "account state + fills" block of a real trading console (the grid-bot
// dashboard the operator pointed at), minus sizes and dollars — direction,
// timing and percentage outcomes only.
export async function LiveTradesPanel({
  locale,
  live,
}: {
  locale: string;
  live: LiveStatus | null;
}) {
  const t = await getTranslations({ locale, namespace: 'dashboardPage.livePanel' });
  const op = live?.open_position;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-ink/70 p-4 sm:p-5">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="font-body text-xs uppercase tracking-[0.25em] text-iris-violet/80">
            {t('open')}
          </div>
          {!live ? (
            <div className="mt-3 font-body text-sm text-mist/50">{t('unavailable')}</div>
          ) : op ? (
            <div className="mt-3">
              <span className={`font-display text-2xl font-light ${DIR_STYLE[op.direction ?? ''] ?? ''}`}>
                {op.direction}
              </span>
              {op.tier && (
                <span className="ml-3 rounded-full border border-white/15 px-2.5 py-0.5 font-body text-xs text-mist/70">
                  {op.tier}
                </span>
              )}
              <div className="mt-2 font-body text-xs text-mist/55">
                {op.entry_price != null && (
                  <span>
                    {t('entry')} ${op.entry_price.toLocaleString()}
                  </span>
                )}
                {op.held_hours != null && <span className="ml-3">{t('held', { h: op.held_hours })}</span>}
              </div>
            </div>
          ) : (
            <div className="mt-3 font-body text-sm text-mist/60">{t('flat')}</div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              [t('cum'), live?.totals.cum_net_pct != null ? `${live.totals.cum_net_pct >= 0 ? '+' : ''}${live.totals.cum_net_pct.toFixed(1)}%` : '—'],
              [t('wr'), live?.totals.win_rate_pct != null ? `${live.totals.win_rate_pct.toFixed(0)}%` : '—'],
              [t('trades'), live ? `${live.totals.n_closed}` : '—'],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <div className="font-display text-xl font-light">{value}</div>
              <div className="mt-1 font-body text-xs text-mist/50">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="font-body text-xs uppercase tracking-[0.25em] text-iris-violet/80">
          {t('recent')}
        </div>
        {live && live.recent.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full font-body text-xs">
              <thead>
                <tr className="text-left text-mist/45">
                  <th className="py-1.5 pr-4 font-normal">{t('time')}</th>
                  <th className="py-1.5 pr-4 font-normal">{t('dir')}</th>
                  <th className="py-1.5 pr-4 text-right font-normal">{t('net')}</th>
                  <th className="py-1.5 font-normal">{t('reason')}</th>
                </tr>
              </thead>
              <tbody>
                {live.recent.map((r, i) => (
                  <tr key={i} className="border-t border-white/5 text-mist/75">
                    <td className="py-2 pr-4 tabular-nums">{r.entry_utc ?? '—'}</td>
                    <td className={`py-2 pr-4 ${DIR_STYLE[r.direction ?? ''] ?? ''}`}>{r.direction}</td>
                    <td
                      className={`py-2 pr-4 text-right tabular-nums ${
                        (r.net_pct ?? 0) > 0 ? 'text-[#00ffa3]' : 'text-[#ff3860]'
                      }`}
                    >
                      {r.net_pct != null ? `${r.net_pct >= 0 ? '+' : ''}${r.net_pct.toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2 font-mono text-[11px] text-mist/50">{r.exit_reason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-3 font-body text-sm text-mist/50">
            {live ? t('empty') : t('unavailable')}
          </div>
        )}
      </div>
    </div>
  );
}
