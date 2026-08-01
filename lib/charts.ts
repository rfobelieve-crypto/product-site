// Interactive chart pages are pure HTTP relays served by the agent-mcp
// service (see indicator/agent/server.py `_proxy_html` in the flow_system
// repo) — the bytes are a full already-rendered HTML page (TradingView
// Lightweight Charts, zoom/pan/crosshair built in), so these are consumed
// via an <iframe> rather than fetched server-side. Same
// fallback-default-URL pattern as lib/signalFeed.ts and its siblings,
// still overridable per-environment via env vars.
//
// 2026-07-24: replaced the earlier static-PNG relays (V7_CHART_URL pointed
// at /public/chart, a CANCEL_FLOW_CHART_URL pointed at
// /public/cancel-flow-chart) with these interactive equivalents — "every
// chart on the site should be operable like the interactive one."
export const V7_CHART_URL =
  process.env.V7_CHART_URL ?? 'https://agent-mcp-production-46d7.up.railway.app/public/live-chart';

export const CANCEL_FLOW_CHART_I_URL =
  process.env.CANCEL_FLOW_CHART_I_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/cancel-flow-chart-i';

// V7 cumulative performance PNG (2026-08-02). Static image, not an
// interactive page: it is four matplotlib panels rendered on the
// indicator service and relayed by the agent with a 30-min TTL, because
// each render is a subprocess. Consumed via <img> (ImagePanel), not an
// iframe.
export const V7_ACCUM_URL =
  process.env.V7_ACCUM_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/v7-accum';

// Strategy #2 (sweep-failure) shadow liquidity map — BTC, last 72h window.
// The agent route pins the symbol server-side on purpose (a public symbol
// passthrough would fan out subprocess renders on the indicator service).
export const LIQUIDITY_CHART_URL =
  process.env.LIQUIDITY_CHART_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/liquidity-map';
