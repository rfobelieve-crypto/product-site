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

const HISTORY_URL =
  process.env.SIGNAL_HISTORY_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/signal-history';

/** Same discipline as lib/signalFeed.ts / lib/trackRecord.ts: server-only,
 * hard timeout, null on any failure. */
export async function getSignalHistory(): Promise<SignalHistory | null> {
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
