// Chart pages are already-rendered interactive HTML (TradingView Lightweight
// Charts, zoom/pan/crosshair built in), consumed via <iframe>.
//
// 2026-09-30: the site is now a static portfolio. The Railway backend that
// used to relay these pages (agent-mcp `/public/*`) was retired together with
// its MySQL, so every chart below is a frozen copy rendered on the research
// machine and served from `public/archive/`. Each env var still overrides the
// default if a live relay ever comes back.
//
// Snapshot dates (what the reader is looking at):
//   v7-chart.html         V7 signals on BTC price      2026-05 snapshot
//   v7-accum.html         V7 cumulative performance    2026-08-02
//   liquidity-map.html    sweep-failure shadow map     2026-09-03
//   sweep-backtest/*.html sweep-failure replay (core9) 2026-09-07
//   conj-backtest/*.html  SDV replay (core9)           2026-09-19
//   cancel-flow.html      cancel-flow review           2026-07-29

export const V7_CHART_URL = process.env.V7_CHART_URL ?? '/archive/v7-chart.html';

export const CANCEL_FLOW_CHART_I_URL =
  process.env.CANCEL_FLOW_CHART_I_URL ?? '/archive/cancel-flow.html';

export const V7_ACCUM_I_URL = process.env.V7_ACCUM_I_URL ?? '/archive/v7-accum.html';

export const LIQUIDITY_CHART_URL =
  process.env.LIQUIDITY_CHART_URL ?? '/archive/liquidity-map.html';

// Per-symbol viewers: BacktestChart appends `/<SYMBOL>.html`.
export const BACKTEST_CHART_URL = process.env.BACKTEST_CHART_URL ?? '/archive/sweep-backtest';

export const CONJ_BACKTEST_CHART_URL =
  process.env.CONJ_BACKTEST_CHART_URL ?? '/archive/conj-backtest';

// 2026-10-04: live regime board (TradingView Lightweight Charts), rebuilt
// hourly on the research machine (arb/ops/regime_site.py) and committed to
// public/archive/regime/ — the one chart on this site that is not a snapshot.
export const REGIME_CHART_URL = process.env.REGIME_CHART_URL ?? '/archive/regime/index.html';
export const REGIME_ACCURACY_URL = process.env.REGIME_ACCURACY_URL ?? '/archive/regime/accuracy.html';
