// Pre-registration board (2026-08-26). The open hypotheses and their
// progress lived only in TODO.md sections and one script per clock, so from
// outside the site it looked like nothing was running while five clocks
// accumulated. This surface makes the discipline visible.
//
// PROGRESS ONLY, by design: every verdict keeps a single owning scorer on
// the research side, so no number rendered here can drift away from the one
// that actually decides. If you find yourself wanting to add a win rate or
// a mean R to this board, that belongs on the strategy's own card instead.

export type PreregOpen = {
  id: string;
  line: string;
  title: string;
  hypothesis: string;
  why: string;
  registered: string;
  source: 'json' | 'count' | 'date';
  n: number | null;
  gate_n: number | null;
  days: number;
  gate_days: number | null;
  note: string;
};

export type PreregSettled = {
  id: string;
  line: string;
  title: string;
  verdict: string;
  tone: 'ok' | 'warn' | 'dead';
  text: string;
};

export type PreregBoard = {
  asof_utc?: string;
  open: PreregOpen[];
  settled: PreregSettled[];
  principle: string;
  disclaimer: string;
};

const PREREG_URL =
  process.env.PREREG_CLOCKS_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/prereg-clocks';

/**
 * Same degrade contract as every /public consumer: an outage returns null,
 * the card renders nothing, the page never throws.
 */
export async function getPreregBoard(): Promise<PreregBoard | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(PREREG_URL, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error || !Array.isArray(data?.open)) return null;
    return data as PreregBoard;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fraction complete for one clock, 0..1.
 *
 * A gate with BOTH a count and a wall-time requirement is only met when
 * both are met, so progress is the MINIMUM of the two — never the average
 * and never the count alone. Showing the friendlier of the two would let
 * a bar sit near full while the binding constraint has barely moved.
 */
export function preregProgress(c: PreregOpen): number {
  const parts: number[] = [];
  if (c.gate_n && c.n != null) parts.push(c.n / c.gate_n);
  if (c.gate_days) parts.push(c.days / c.gate_days);
  if (!parts.length) return 0;
  return Math.max(0, Math.min(1, Math.min(...parts)));
}
