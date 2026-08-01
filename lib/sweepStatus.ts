export type SweepGate = {
  n_closed: number;
  n_open: number;
  floor: number;
  mean_r: number | null;
  ci_low: number | null;
  wr_pct: number | null;
  status: 'PASS' | 'accumulating' | 'empty';
};

export type LedgerRow = {
  key: string;
  label_zh?: string;
  n_closed: number;
  n_open: number;
  mean_r: number | null;
  ci_low: number | null;
  wr_pct: number | null;
  status: string;
};

export type ResearchClocks = {
  gate_b_closed: number;
  gate_b_target: number;
  depth_days: number;
  depth_target: number;
  tracked_strong: number;
  next_verdict: string;
} | null;

export type SweepStatus = {
  gate: SweepGate;
  cohorts?: LedgerRow[];
  combos?: LedgerRow[];
  clocks?: ResearchClocks;
  watchlist_registered?: string;
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
