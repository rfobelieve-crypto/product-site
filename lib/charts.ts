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
// Interactive four-pane version (zoom/pan/crosshair), same data the PNG
// route renders. The site embeds this one — a static image was the wrong
// shape next to charts that are all operable.
export const V7_ACCUM_I_URL =
  process.env.V7_ACCUM_I_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/v7-accum-i';

// Strategy #2 (sweep-failure) shadow liquidity map — BTC, last 72h window.
// The agent route pins the symbol server-side on purpose (a public symbol
// passthrough would fan out subprocess renders on the indicator service).
// ?bare=1 是必須的，不是可選的美化（2026-09-08 修）。那個頁面自己帶一個
// 固定高度的表頭（變體表 + 三段說明 + 圖例，約 400px），而圖表的高度寫成
// `#c{height:62vh}` —— **固定像素的表頭 + 百分比的圖**，在 iframe 那個矮
// 視窗裡（75vh ≈ 530px）表頭就把整個框填滿，圖被推到框外看不見。
// bare 模式（`html.bare body>*:not(#c){display:none}` + `#c{height:96vh}`）
// 本來就是為嵌入設計的，只是這裡一直沒帶參數。
// 表頭的內容不會因此消失——變體表與 KPI 在 /charts/liquidity 頁面上本來
// 就各有一份，iframe 裡那份是重複的。
export const LIQUIDITY_CHART_URL =
  process.env.LIQUIDITY_CHART_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/liquidity-map?bare=1';

// Strategy #2 (sweep-failure) HISTORICAL backtest viewer, 2026-09-07.
// Different question from LIQUIDITY_CHART_URL: that one is a live map of
// what is on the book right now; this one replays every trade the FROZEN
// engine actually took, with the level line, the fill, the disaster stop
// and the exit drawn from the SAME record the backtest scores (pinned by
// research/sweep_failure/tests/test_backtest_detail_parity.py in
// flow_system). It exists so entries and exits can be eyeballed against
// the rules instead of trusted.
//
// Symbol IS a query param here (core9 only); the agent route pins the
// window server-side so the origin sees one cache key per symbol, not one
// per symbol x range. Range control lives inside the page (zoom/pan).
export const BACKTEST_CHART_URL =
  process.env.BACKTEST_CHART_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/backtest-chart';

// Conjunction line (sweep ∧ forced flow, TODO §1.03 in flow_system) —
// the rule set that goes to small-size live on 2026-09-08 — gets the SAME
// kind of viewer, 2026-09-08 ("那個歷史回測應該要顯示交會的那個策略才對").
// The sweep-failure viewer above stays reachable as the closed line's
// record; this one is the page's primary tab.
//
// No origin render behind this route: the page needs minute bars, OI and
// event tables that live only on the research machine, so that machine
// renders one HTML per core9 symbol into `conj_backtest_pages` and the
// agent relays the row (same off-cloud-recorder pattern as the V7 veto
// clock). Symbol is a query param; window is fixed at 90 days server-side.
export const CONJ_BACKTEST_CHART_URL =
  process.env.CONJ_BACKTEST_CHART_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/conj-backtest';
