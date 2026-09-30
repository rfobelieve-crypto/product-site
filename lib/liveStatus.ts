import ARCHIVE from '@/content/archive/live-status.json';
export type LiveStatus = {
  open_position: {
    direction: string | null;
    tier: string | null;
    entry_price: number | null;
    held_hours: number | null;
  } | null;
  recent: {
    entry_utc: string | null;
    direction: string | null;
    net_pct: number | null;
    exit_reason: string | null;
  }[];
  totals: {
    n_closed: number;
    win_rate_pct: number | null;
    cum_net_pct: number | null;
  };
  disclaimer: string;
};

// 2026-09-30: agent-mcp (Railway) is retired; the site is a static portfolio.
// No env var -> serve the frozen snapshot content/archive/live-status.json. Setting the env var restores the live fetch.
const LIVE_STATUS_URL = process.env.LIVE_STATUS_URL;

/** Server-only, null on any failure — same contract as lib/signalFeed.ts. */
export async function getLiveStatus(): Promise<LiveStatus | null> {
  if (!LIVE_STATUS_URL) return ARCHIVE as unknown as LiveStatus;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(LIVE_STATUS_URL, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error || !data?.totals) return null;
    return data as LiveStatus;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
