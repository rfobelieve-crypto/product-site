export type SignalFeed = {
  signal_time: string | null;
  direction: string | null;
  tier: string | null;
  confidence: number | null;
  regime: string | null;
  entry_price: number | null;
  disclaimer: string | null;
};

// 2026-09-30: agent-mcp (Railway) is retired; the site is a static portfolio.
// No env var -> null (its source table died with the MySQL; the UI hides the panel). Setting the env var restores the live fetch.
const FEED_URL = process.env.SIGNAL_FEED_URL;

/**
 * Server-only fetch — called from a Server Component (app/page.tsx), never
 * from the browser. Cached at the edge for 60s (matches the route's own
 * in-process cache on the agent service, see indicator/agent/server.py).
 *
 * Returns null on any failure (network, non-200, bad JSON) rather than
 * throwing — a signal-feed outage must never take the marketing page down
 * with it.
 */
export async function getSignalFeed(): Promise<SignalFeed | null> {
  if (!FEED_URL) return null;
  // A slow/unreachable agent service must never hold up the page render —
  // hard-cap the wait regardless of what's causing the slowness.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error) return null;
    return data as SignalFeed;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
