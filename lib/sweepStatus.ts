export type SweepGate = {
  n_closed: number;
  n_open: number;
  floor: number;
  mean_r: number | null;
  ci_low: number | null;
  wr_pct: number | null;
  status: 'PASS' | 'accumulating' | 'empty';
};

export type SweepStatus = {
  gate: SweepGate;
  recent: {
    symbol: string;
    kind: string;
    fill_utc: string;
    variant_b: boolean;
    net_r: number;
  }[];
  asof_utc: string;
  mode: string;
  disclaimer: string;
};

const SWEEP_STATUS_URL =
  process.env.SWEEP_STATUS_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/sweep-status';

/**
 * Server-only fetch, same contract as lib/signalFeed.ts: null on any failure
 * (network, non-200, bad JSON) so a status outage degrades the strategy
 * cards to "—" instead of taking the page down. Revalidates at the route's
 * own cache cadence (300s in indicator/agent/server.py).
 */
export async function getSweepStatus(): Promise<SweepStatus | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(SWEEP_STATUS_URL, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error || !data?.gate) return null;
    return data as SweepStatus;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
