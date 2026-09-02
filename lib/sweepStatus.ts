export type SweepGate = {
  n_closed: number;
  n_open: number;
  floor: number;
  mean_r: number | null;
  ci_low: number | null;
  wr_pct: number | null;
  status: 'PASS' | 'FAIL' | 'accumulating' | 'empty';
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

/**
 * Settled Gate F verdicts, read at the frozen floor by the owning scorers
 * (research/sweep_failure/shadow_engine.py for B, sweep_forward.py for A).
 *
 * 2026-09-02: variant B hit its 1400-trade floor and FAILED (day-clustered
 * CI low below zero); C and D are nested inside B, so they are void by
 * inheritance -- no re-judging of subsets. This lives here because
 * /public/sweep-status only starts reporting 'FAIL' after flow_system
 * redeploys the scorer, and because the cohort labels that endpoint returns
 * are the agent's own strings, not the recorder's. Both agree afterwards.
 */
export const SWEEP_SETTLED: Record<string, 'FAIL' | 'VOID'> = {
  B: 'FAIL',
  C: 'VOID',
  D: 'VOID',
};

/**
 * The numbers the frozen scorer read at variant B's floor on 2026-09-02
 * (TODO.md 0.92 / research/sweep_failure/shadow_engine.py --gate). A settled
 * verdict never moves, so these are constants on purpose -- do not "refresh"
 * them. The live endpoint keeps recomputing B in-image from the CSV shipped
 * with the last flow_system deploy, which is why it can report a smaller n.
 */
export const SWEEP_B_VERDICT = {
  date: '2026-09-02',
  n_closed: 1428,
  floor: 1400,
  mean_r: -0.0098,
  ci_low: -0.0942,
  wr_pct: 55.8,
};

export type ResearchClocks = {
  gate_b_closed: number;
  gate_b_target: number;
  depth_days: number;
  depth_target: number;
  tracked_strong: number;
  next_verdict: string;
} | null;

export type V7Clock = {
  tier: string;
  kept_wr: number | null;
  veto_wr: number | null;
  gap_pp: number | null;
  n_kept: number;
  n_veto: number;
  since_trigger: number;
  since_trigger_fired?: number;
  trigger_target: number;
  gap_threshold_pp: number;
};

export type V7Filters = {
  clocks?: { strong?: V7Clock; moderate?: V7Clock };
  kept_wr: number | null;
  veto_wr: number | null;
  gap_pp: number | null;
  n_kept: number;
  n_veto: number;
  strong_since_trigger: number;
  trigger_target: number;
  gap_threshold_pp: number;
  asof_utc: string;
} | null;

export type SweepStatus = {
  gate: SweepGate;
  v7_filters?: V7Filters;
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
