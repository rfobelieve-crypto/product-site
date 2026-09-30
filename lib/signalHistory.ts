export type SignalHistoryEntry = {
  signal_time: string | null;
  direction: string | null;
  tier: string | null;
  confidence: number | null;
  regime: string | null;
  correct: number | null;
};

export type SignalHistory = {
  signals: SignalHistoryEntry[];
  disclaimer: string;
};

// 2026-09-30: agent-mcp (Railway) is retired; the site is a static portfolio.
// No env var -> null (its source table died with the MySQL; the UI hides the panel). Setting the env var restores the live fetch.
const HISTORY_URL = process.env.SIGNAL_HISTORY_URL;

/** Same discipline as lib/signalFeed.ts / lib/trackRecord.ts: server-only,
 * hard timeout, null on any failure. */
export async function getSignalHistory(): Promise<SignalHistory | null> {
  if (!HISTORY_URL) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(HISTORY_URL, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error) return null;
    return data as SignalHistory;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
