export type CancelFlowCoinStat = {
  symbol: string;
  n_minutes: number;
  cancel_ratio_pct: number | null;
  ask_bid_skew_pct: number | null;
  last_updated: string | null;
};

export type CancelFlowStats = {
  window_minutes: number;
  coins: CancelFlowCoinStat[];
  disclaimer: string;
};

// 2026-09-30: agent-mcp (Railway) is retired; the site is a static portfolio.
// No env var -> null (its source table died with the MySQL; the UI hides the panel). Setting the env var restores the live fetch.
const CANCEL_FLOW_STATS_URL = process.env.CANCEL_FLOW_STATS_URL;

/** Same discipline as lib/signalFeed.ts / lib/trackRecord.ts: server-only,
 * hard timeout, null on any failure — a stats-endpoint outage must never
 * take the page down with it. */
export async function getCancelFlowStats(): Promise<CancelFlowStats | null> {
  if (!CANCEL_FLOW_STATS_URL) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(CANCEL_FLOW_STATS_URL, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error) return null;
    return data as CancelFlowStats;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
