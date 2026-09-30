import ARCHIVE from '@/content/archive/track-record.json';
export type TrackRecord = {
  signal_layer: {
    n: number;
    win_rate_pct: number | null;
    ci95: [number, number] | null;
    note: string;
  };
  trade_layer: {
    n_closed: number;
    win_rate_pct: number | null;
    ci95: [number, number] | null;
    note: string;
  };
  mdd_pct: number | null;
  caveat: string;
  disclaimer: string;
};

// 2026-09-30: agent-mcp (Railway) is retired; the site is a static portfolio.
// No env var -> serve the frozen snapshot content/archive/track-record.json. Setting the env var restores the live fetch.
const TRACK_RECORD_URL = process.env.TRACK_RECORD_URL;

/**
 * Server-only fetch, same discipline as lib/signalFeed.ts: hard 4s
 * timeout, null on any failure, never throws — a stats-endpoint outage
 * must never take the page down with it.
 */
export async function getTrackRecord(): Promise<TrackRecord | null> {
  if (!TRACK_RECORD_URL) return ARCHIVE as unknown as TrackRecord;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(TRACK_RECORD_URL, {
      next: { revalidate: 120 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error) return null;
    return data as TrackRecord;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
