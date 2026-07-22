// Chart images are pure HTTP relays served by the agent-mcp service (see
// indicator/agent/server.py `_proxy_png` in the flow_system repo) — the
// bytes are already-rendered PNGs, not JSON, so unlike lib/signalFeed.ts
// and its siblings these are consumed directly by an <img> tag rather
// than fetched server-side. Same fallback-default-URL pattern as those
// files, still overridable per-environment via env vars.
export const V7_CHART_URL =
  process.env.V7_CHART_URL ?? 'https://agent-mcp-production-46d7.up.railway.app/public/chart';

export const CANCEL_FLOW_CHART_URL =
  process.env.CANCEL_FLOW_CHART_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/cancel-flow-chart';
