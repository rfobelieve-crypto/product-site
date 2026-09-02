// Operations board (2026-09-02). The schedule lived in four disconnected
// places — Windows Task Scheduler, a .bat with a dozen publishers inside,
// the freshness board, and a folder of monthly reports — so "is everything
// running, and what did it decide" could only be answered on the
// operator's own machine.
//
// Aliveness is ARTIFACT AGE, never a scheduler's status light: a panel
// showing "Ready" is the exact shape of the failures this surface exists
// to make visible (a daily job pointed at a deleted path for 96 days; a
// CRLF-broken .bat that ran hourly and did nothing for 29 hours).

export type OpsJob = {
  id: string;
  name: string;
  cadence: string;
  what: string;
  artifact: string;
  cost: string;
  healthy: boolean | null;
  artifact_age_h: number | null;
  artifacts_watched: number;
};

export type OpsFreshnessRow = {
  name: string;
  age_h: number | null;
  max_h: number;
  ok: boolean;
  note: string;
};

export type OpsRevalidation = {
  date: string;
  verdict: string;
  summary: string;
  auc: number | null;
  ic: number | null;
  snr_spearman_pct: number | null;
  stale_guard_hit: boolean;
  push_failed: boolean;
};

export type OpsBoard = {
  asof_utc?: string;
  published_utc?: string | null;
  jobs: OpsJob[];
  freshness: { asof_utc?: string | null; rows: OpsFreshnessRow[]; reds: string[] };
  revalidations: OpsRevalidation[];
  principle: string;
  disclaimer: string;
};

const OPS_URL =
  process.env.OPS_BOARD_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/ops-board';

/** Same degrade contract as every /public consumer: an outage returns null,
 *  the section renders nothing, the page never throws. */
export async function getOpsBoard(): Promise<OpsBoard | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(OPS_URL, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error || !Array.isArray(data.jobs)) return null;
    return data as OpsBoard;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
