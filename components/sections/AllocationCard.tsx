// Recommended portfolio configuration (v1, 2026-08-29) — the research
// side's math-backed answer to "how should capital, leverage and risk be
// split across the three strategies". Static by design: these numbers are
// a RULING, not a live metric; they change only when a new ruling lands
// (mill per-trade export → re-optimize), so hardcoding keeps the page in
// step with the single owning document instead of inventing a feed.
//
// Public-surface rules respected: percentages / multipliers / R units
// only — no USD, no account sizes, no model internals. Status chip is
// mandatory (research conclusions on the wall must carry their status).
// Labels ship inline, not via messages JSON (2026-08-01 incident).

const L = {
  zh: {
    title: '建議配置',
    chip: 'v1 · 2026-08-29 · 磨坊資料到手後重算',
    subtitle: '目標不是賺最多，是保證活得夠久讓正期望值複利——每格都由數學或已判決的實驗支撐',
    colStrategy: '',
    cols: ['V7 訊號', '流動性獵取', '磨坊（網格）'],
    rows: [
      ['資金占比', '40%', '40%', '20%'],
      ['有效槓桿（真風險）', '2x（¼ Kelly）', '滿載 1.5~2x', '≤1.5x（保守值）'],
      ['交易所槓桿（鎖押金）', '5~10x', '5x', '1~2x'],
      ['單筆風險', '3×ATR 停損', '總資金 0.15~0.25%', '單格 ≤ 預算 2%'],
      ['同時倉數', '1', '5~10 槽·先到先得', '受庫存上限管'],
      ['日虧斷路', '−6% 停開新倉', '−6%（內建）', '−6%'],
    ],
    whyTitle: '三條設計原則',
    why: [
      '錢跟著證據走：V7 是唯一真錢驗證過的；獵取有 996 筆真前瞻但執行缺口未補；磨坊逐筆資料未到手——它的 20% 是學費不是投資',
      'Kelly 除以 4：下注公式假設 edge 估得準，而 edge 是小樣本估的——寧可站在「估錯也死不了」的那側',
      '停損永遠先於強平：軟體停損有輪詢盲區，交易所槓桿壓低是為了把強平線推遠，保證死法是自己設計的',
    ],
    worst: '最壞情境檢核：三策略同日全部最壞 ≈ −5~7%，落在日斷路附近、離總 kill（−20%）很遠——最壞的一天是痛，不是死',
    caveat: '狀態：建議值。V7 的 edge 信賴區間仍含 0；獵取影子與實盤的執行缺口未閉合前，其占比宜先給一半；磨坊各值為保守佔位，逐筆匯出落地後整欄重算',
  },
  en: {
    title: 'Recommended Configuration',
    chip: 'v1 · 2026-08-29 · re-run when mill data lands',
    subtitle: 'The goal is not maximum return but surviving long enough for thin positive EV to compound — every cell is backed by math or a settled experiment',
    colStrategy: '',
    cols: ['V7 signals', 'Liquidity raids', 'Mill (grid)'],
    rows: [
      ['Capital share', '40%', '40%', '20%'],
      ['Effective leverage (true risk)', '2x (¼ Kelly)', '1.5–2x at full load', '≤1.5x (conservative)'],
      ['Exchange leverage (margin lock)', '5–10x', '5x', '1–2x'],
      ['Per-trade risk', '3×ATR stop', '0.15–0.25% of total', 'per rung ≤ 2% of budget'],
      ['Concurrent positions', '1', '5–10 slots · FCFS', 'inventory-capped'],
      ['Daily circuit breaker', '−6% halts entries', '−6% (built in)', '−6%'],
    ],
    whyTitle: 'Three design principles',
    why: [
      'Capital follows evidence: V7 is the only live-verified edge; raids have 996 true-forward trades but an unclosed execution gap; the mill has no per-trade data yet — its 20% is tuition, not investment',
      'Kelly divided by four: the betting formula assumes the edge estimate is right, and it comes from small samples — stand on the side where being wrong is survivable',
      'Stops must always fire before liquidation: software stops have a polling blind window, so exchange leverage is kept low to push the liquidation line far away',
    ],
    worst: 'Worst-case check: all three strategies hitting their worst day together ≈ −5–7%, near the daily breaker and far from the total kill (−20%) — the worst day is pain, not death',
    caveat: 'Status: recommendation. V7’s edge CI still contains zero; until the raid shadow-vs-live execution gap closes, half its share is prudent; mill values are conservative placeholders pending the per-trade export',
  },
};

export function AllocationCard({ locale }: { locale: string }) {
  const t = locale === 'zh' ? L.zh : L.en;
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <h3 className="font-display text-sm font-light text-mist">{t.title}</h3>
        <span className="rounded-full border border-dashed border-amber-400/40 px-2.5 py-0.5 font-body text-[10px] uppercase tracking-[0.15em] text-amber-300/80">
          {t.chip}
        </span>
      </div>
      <p className="mt-1 max-w-3xl font-body text-[11px] leading-relaxed text-mist/45">
        {t.subtitle}
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-white/[0.07] bg-white/[0.02]">
        <table className="w-full min-w-[560px] border-collapse font-body text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.07] text-left">
              <th className="px-3.5 py-2.5 font-normal text-mist/40">{t.colStrategy}</th>
              {t.cols.map((c) => (
                <th key={c} className="px-3.5 py-2.5 font-normal text-iris-cyan/80">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r) => (
              <tr key={r[0]} className="border-b border-white/[0.05] last:border-0">
                <td className="px-3.5 py-2 text-mist/45">{r[0]}</td>
                {r.slice(1).map((v, i) => (
                  <td key={i} className="px-3.5 py-2 tabular-nums text-mist/80">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {t.why.map((w, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 font-body text-[11px] leading-relaxed text-mist/55"
          >
            {w}
          </div>
        ))}
      </div>

      <p className="mt-3 font-body text-[11px] leading-relaxed text-mist/50">{t.worst}</p>
      <p className="mt-1.5 font-body text-[10px] leading-relaxed text-mist/35">{t.caveat}</p>
    </div>
  );
}
