export type SignalFeed = {
  signal_time: string | null;
  direction: string | null;
  tier: string | null;
  confidence: number | null;
  regime: string | null;
  entry_price: number | null;
  disclaimer: string | null;
};

const FEED_URL =
  process.env.SIGNAL_FEED_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/signal-feed';

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
