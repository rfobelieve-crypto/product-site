// §0.75 arbitrage family (2026-09-01). Line 4's public face used to be a
// single progress bar for one pair, while seven recorders were running —
// from outside the site the other six did not exist.
//
// PERCENTAGES, DIRECTION AND TIME ONLY. Every dollar figure (book depth,
// capturable USD/day) is stripped on the research side before publishing,
// so this module cannot leak one by accident. Depth survives as a
// qualitative tier because "the band is fat but the book is thin" is the
// most important honest caveat on this line.
//
// No verdict is computed here or on the endpoint: premium_verdict.py is the
// single owning scorer, same discipline as the pre-registration board.

export type ArbSide = {
  band_bps: number | null;
  fires_per_day: number | null;
  converges: boolean | null;
  convergence_frac: number | null;
  convergence_episodes: number | null;
  median_minutes_to_converge: number | null;
  depth_tier: 'thin' | 'moderate' | 'deep' | null;
  stale_prints: number | null;
};

export type ArbCarry = {
  median_bps_8h: number | null;
  annualised_pct: number | null;
  frac_positive: number | null;
  n: number | null;
};

export type ArbPair = {
  pair: string;
  legs: string | null;
  note: string | null;
  status: string | null;
  minutes: number | null;
  days: number | null;
  gate_days: number | null;
  start_utc: string | null;
  is_control: boolean;
  sell: ArbSide | null;
  buy: ArbSide | null;
  carry: ArbCarry | null;
  verdict?: string | null;
};

// The battlefield scan (2026-09-03). The recording family is the weapon and
// it is fixed; this is the search for where to point it. A SEARCH board, not
// a verdict board: scan_rank.py owns the promotion metric, premium_verdict.py
// owns every verdict, and the ranking metric itself (capturable USD/day)
// never crosses the wire — only the ORDER it produces does.
export type ArbFeeRow = {
  venue: string;
  taker_bps: number;
  rebate_pct: number;
  effective_bps: number;
  verified: boolean;
  note: string;
};

export type ArbScanRow = {
  pair: string;
  asset_class: string;
  band_bps: number | null;
  required_band_bps: number | null;
  net_per_trade_bps: number | null;
  fee_ok: boolean;
  fee_unverified: string[];
  band_vs_control: number | null;
  fires_per_day: number | null;
  depth_tier: 'thin' | 'moderate' | 'deep' | null;
  samples: number | null;
  stage: string;
};

export type ArbLadderStep = { step: string; state: string; means: string };

export type ArbScan = {
  asof_utc?: string | null;
  span_days?: number | null;
  quotes?: number | null;
  pairs?: number | null;
  gate_ok?: boolean;
  control_band_bps?: number | null;
  // Pairs still below the per-pair sample threshold. The board lists only
  // pairs that cleared it, so without this number a newly added venue looks
  // like it was never scanned rather than like it is still counting.
  pending_pairs?: number | null;
  rows: ArbScanRow[];
  fees?: ArbFeeRow[];
  fee_rule?: string;
  ladder: ArbLadderStep[];
  caveat: string;
};

export type ArbStatus = {
  asof_utc?: string;
  published_utc?: string | null;
  gate_days?: number;
  pairs: ArbPair[];
  scan?: ArbScan | null;
  principle: string;
  carry_note: string;
  disclaimer: string;
};

const ARB_URL =
  process.env.ARB_STATUS_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/arb-status';

/** Same degrade contract as every /public consumer: an outage returns null,
 *  the section renders nothing, the page never throws. */
export async function getArbStatus(): Promise<ArbStatus | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(ARB_URL, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error || !Array.isArray(data.pairs)) return null;
    return data as ArbStatus;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
