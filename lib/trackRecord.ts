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

const TRACK_RECORD_URL =
  process.env.TRACK_RECORD_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/track-record';

/**
 * Server-only fetch, same discipline as lib/signalFeed.ts: hard 4s
 * timeout, null on any failure, never throws — a stats-endpoint outage
 * must never take the page down with it.
 */
export async function getTrackRecord(): Promise<TrackRecord | null> {
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
