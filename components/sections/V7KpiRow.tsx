import { getTranslations } from 'next-intl/server';
import { getSignalFeed } from '@/lib/signalFeed';
import { getTrackRecord } from '@/lib/trackRecord';
import { StatCard, StatCardGrid } from '@/components/sections/StatCard';

const DIRECTION_LABEL: Record<string, string> = {
  UP: '↑ UP',
  DOWN: '↓ DOWN',
  NEUTRAL: '· NEUTRAL',
};

function fmtCi(ci: [number, number] | null): string | null {
  if (!ci) return null;
  return `95% CI [${ci[0].toFixed(0)}, ${ci[1].toFixed(0)}]`;
}

// Server component — both fetches run in parallel, each independently
// null-safe (see lib/signalFeed.ts / lib/trackRecord.ts), so a partial
// outage degrades individual cards to "—" instead of the whole row.
export async function V7KpiRow({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'chartsPage.v7.kpi' });
  const [feed, track] = await Promise.all([getSignalFeed(), getTrackRecord()]);

  const dash = '—';
  const direction = feed?.direction ? DIRECTION_LABEL[feed.direction] ?? feed.direction : dash;
  const confidence = feed?.confidence != null ? feed.confidence.toFixed(0) : dash;
  const regime = feed?.regime ?? dash;
  const strongWr = track?.signal_layer.win_rate_pct != null
    ? `${track.signal_layer.win_rate_pct.toFixed(0)}%` : dash;
  const tradeWr = track?.trade_layer.win_rate_pct != null
    ? `${track.trade_layer.win_rate_pct.toFixed(0)}%` : dash;
  const mdd = track?.mdd_pct != null ? `${track.mdd_pct.toFixed(1)}%` : dash;

  return (
    <StatCardGrid>
      <StatCard label={t('direction')} value={direction} note={feed?.tier ?? null} />
      <StatCard label={t('confidence')} value={confidence} />
      <StatCard label={t('regime')} value={regime} />
      <StatCard
        label={t('strongWr')}
        value={strongWr}
        note={fmtCi(track?.signal_layer.ci95 ?? null) ?? track?.signal_layer.note ?? null}
      />
      <StatCard
        label={t('tradeWr')}
        value={tradeWr}
        note={fmtCi(track?.trade_layer.ci95 ?? null) ?? track?.trade_layer.note ?? null}
      />
      <StatCard label={t('mdd')} value={mdd} />
    </StatCardGrid>
  );
}
