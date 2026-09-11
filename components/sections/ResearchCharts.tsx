import {
  listResearchCharts,
  researchChartsUpdated,
  type Chart,
  type SlopePoint,
  type RankPoint,
  type TwoColRow,
  type BarPoint,
  type CountRow,
} from '@/lib/researchCharts';

// 研究結果的圖（2026-09-11）。使用者要求：「把研究的東西都顯示在網站上，
// 盡量以圖表輔助顯示說明」。
//
// 為什麼是圖不是又一段散文：方法論頁在講「我們怎麼判斷真假」，而這套方法
// 最有說服力的東西**本來就是圖形**——一條線在前半很漂亮、在後半翻號，
// 用講的沒有用，用畫的一眼就懂。
//
// 三條這個元件要守的規矩：
//  1. **不做任何算術。** 每個數字都由 research/publish_research_charts.py
//     從做決定的那份結果檔生成；在這裡算一次就是第二份實作。
//  2. **負面結果一樣要畫。** 這五張裡有四張畫的是「被否決的東西」——
//     只畫活下來的那些，是對過程說謊。
//  3. **公開面**：只出百分比、方向、時間、計數。產生端有正則守衛擋金額，
//     這裡也不得自己寫出任何金額。
//
// 純內嵌 SVG：這個網站沒有圖表庫，而且加一個只為了五張靜態圖不划算。
// 伺服器端渲染，零 client JS。降級契約同其他卡片：沒有內容就整段不出。

const L = {
  zh: {
    eyebrow: '研究實錄',
    title: '被資料否決的長什麼樣子',
    lede:
      '下面每一張圖都是一次真實的檢定，而其中四張畫的是被否決的東西。只展示活下來的那些，是對過程說謊。',
    source: '資料來源',
    updated: '更新',
    flipped: '翻號',
    kept: '維持',
    first: '前半',
    second: '後半',
    events: '機會數（相對不等待）',
    value: '價值（相對不等待）',
    inconclusive: '標準誤大於效果 — 無效判決，不是通過',
    before: '原本',
    after: '現在',
    pairsUnit: '個配對',
  },
  en: {
    eyebrow: 'Research log',
    title: 'What being rejected by the data looks like',
    lede:
      'Each chart below is a real test, and four of the five show something that was rejected. Showing only the survivors would be a lie about the process.',
    source: 'Source',
    updated: 'Updated',
    flipped: 'flipped',
    kept: 'held',
    first: 'First half',
    second: 'Second half',
    events: 'Opportunities (relative to no wait)',
    value: 'Value (relative to no wait)',
    inconclusive: 'Standard error exceeds the effect — inconclusive, not a pass',
    before: 'Before',
    after: 'Now',
    pairsUnit: 'pairs',
  },
} as const;

// `as const` 讓中英兩組成為不同的**字面型別**，直接用 (typeof L)['zh']
// 當參數型別會讓英文那組不相容。把它放寬成「同樣的鍵、值是 string」。
type Labels = { [K in keyof (typeof L)['zh']]: string };

const CYAN = '#4fd1c5';
const ROSE = '#f08a8a';
const MUTED = 'rgba(226,232,240,0.28)';

function Frame({
  chart,
  children,
  t,
}: {
  chart: Chart;
  children: React.ReactNode;
  t: Labels;
}) {
  return (
    <section className="mt-12 rounded-2xl border border-white/10 bg-ink/40 p-6">
      <h3 className="font-display text-lg font-light leading-snug text-mist">
        {chart.copy.title}
      </h3>
      {chart.copy.lede ? (
        <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-mist/65">
          {chart.copy.lede}
        </p>
      ) : null}
      <div className="mt-6 overflow-x-auto">{children}</div>
      {chart.copy.note ? (
        <p className="mt-5 max-w-3xl font-body text-[13px] leading-relaxed text-mist/55">
          {chart.copy.note}
        </p>
      ) : null}
      <p className="mt-4 font-body text-[11px] text-mist/30">
        {t.source}: <code className="text-mist/40">{chart.source}</code>
      </p>
    </section>
  );
}

// ── 斜線圖：前半 -> 後半 ────────────────────────────────────────────────
function Slope({ chart, t }: { chart: Chart; t: Labels }) {
  const pts = chart.series as SlopePoint[];
  if (!pts.length) return null;
  const vals = pts.flatMap((p) => [p.first, p.second]);
  const lo = Math.min(...vals, 0);
  const hi = Math.max(...vals, 0);
  const W = 560;
  const H = 260;
  const padL = 96;
  const padR = 96;
  const padY = 26;
  const y = (v: number) => padY + (1 - (v - lo) / (hi - lo || 1)) * (H - padY * 2);
  const zero = y(0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img">
      <line x1={padL} y1={zero} x2={W - padR} y2={zero} stroke={MUTED} strokeDasharray="3 4" />
      <text x={padL - 8} y={zero + 4} textAnchor="end" className="fill-mist/30" fontSize="10">
        0
      </text>
      {pts.map((p) => {
        const col = p.flipped ? ROSE : CYAN;
        return (
          <g key={p.arm}>
            <line
              x1={padL}
              y1={y(p.first)}
              x2={W - padR}
              y2={y(p.second)}
              stroke={col}
              strokeWidth={p.flipped ? 1.6 : 1.2}
              opacity={p.flipped ? 0.9 : 0.5}
            />
            <circle cx={padL} cy={y(p.first)} r="3" fill={col} opacity="0.9" />
            <circle cx={W - padR} cy={y(p.second)} r="3" fill={col} opacity="0.9" />
            <text
              x={padL - 8}
              y={y(p.first) + 3}
              textAnchor="end"
              fontSize="10"
              fill={col}
              opacity="0.85"
            >
              {p.arm}
            </text>
            <text
              x={W - padR + 8}
              y={y(p.second) + 3}
              fontSize="10"
              fill={col}
              opacity="0.6"
            >
              {p.second.toFixed(2)}
            </text>
          </g>
        );
      })}
      <text x={padL} y={H - 6} textAnchor="middle" className="fill-mist/35" fontSize="10">
        {chart.copy.xlabel ?? t.first}
      </text>
      <text x={W - padR} y={H - 6} textAnchor="middle" className="fill-mist/35" fontSize="10">
        {chart.copy.ylabel ?? t.second}
      </text>
      {chart.copy.unit ? (
        <text x={W / 2} y={14} textAnchor="middle" className="fill-mist/25" fontSize="10">
          {chart.copy.unit}
        </text>
      ) : null}
    </svg>
  );
}

// ── 名次斜線圖 ─────────────────────────────────────────────────────────
function RankSlope({ chart, t }: { chart: Chart; t: Labels }) {
  const pts = chart.series as RankPoint[];
  if (!pts.length) return null;
  const n = pts.length;
  const W = 560;
  const H = 250;
  const padL = 96;
  const padR = 96;
  const padY = 22;
  const y = (r: number) => padY + ((r - 1) / (n - 1 || 1)) * (H - padY * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img">
      {pts.map((p) => {
        const worse = p.second_rank > p.first_rank;
        const col = worse ? ROSE : CYAN;
        return (
          <g key={p.name}>
            <line
              x1={padL}
              y1={y(p.first_rank)}
              x2={W - padR}
              y2={y(p.second_rank)}
              stroke={col}
              strokeWidth="1.3"
              opacity="0.65"
            />
            <circle cx={padL} cy={y(p.first_rank)} r="3" fill={col} opacity="0.9" />
            <circle cx={W - padR} cy={y(p.second_rank)} r="3" fill={col} opacity="0.9" />
            <text x={padL - 8} y={y(p.first_rank) + 3} textAnchor="end" fontSize="10" fill={col} opacity="0.85">
              {p.name}
            </text>
            <text x={W - padR + 8} y={y(p.second_rank) + 3} fontSize="10" fill={col} opacity="0.6">
              {p.name}
            </text>
          </g>
        );
      })}
      <text x={padL} y={H - 4} textAnchor="middle" className="fill-mist/35" fontSize="10">
        {chart.copy.xlabel}
      </text>
      <text x={W - padR} y={H - 4} textAnchor="middle" className="fill-mist/35" fontSize="10">
        {chart.copy.ylabel}
      </text>
    </svg>
  );
}

// ── 兩欄：資訊層 vs 執行層 ──────────────────────────────────────────────
function TwoColumn({ chart, t }: { chart: Chart; t: Labels }) {
  const rows = chart.series as TwoColRow[];
  return (
    <table className="w-full min-w-[520px] border-collapse font-body text-[13px]">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wider text-mist/35">
          <th className="pb-2 pr-4 font-normal" />
          <th className="pb-2 pr-4 font-normal">{chart.copy.colA}</th>
          <th className="pb-2 font-normal">{chart.copy.colB}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-t border-white/5 align-top">
            <td className="py-2.5 pr-4 text-mist/70">{r.name}</td>
            <td className="py-2.5 pr-4" style={{ color: CYAN, opacity: 0.8 }}>
              {r.info}
            </td>
            <td className="py-2.5" style={{ color: ROSE, opacity: 0.85 }}>
              {r.exec_}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── 長條：耐心的代價 ───────────────────────────────────────────────────
function Bars({ chart, t }: { chart: Chart; t: Labels }) {
  const pts = chart.series as BarPoint[];
  if (!pts.length) return null;
  const W = 560;
  const H = 230;
  const padL = 44;
  const padB = 40;
  const bw = (W - padL - 16) / pts.length;
  const maxV = Math.max(...pts.map((p) => Math.max(p.events_pct, (p.value_x ?? 0) * 100)), 100);
  const h = (v: number) => ((v / maxV) * (H - padB - 20));
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img">
        <line x1={padL} y1={H - padB} x2={W - 8} y2={H - padB} stroke={MUTED} />
        {pts.map((p, i) => {
          const x = padL + i * bw;
          const he = h(p.events_pct);
          const hv = h((p.value_x ?? 0) * 100);
          return (
            <g key={p.k}>
              <rect x={x + 4} y={H - padB - he} width={bw * 0.36} height={he} fill={MUTED} />
              <rect
                x={x + 4 + bw * 0.4}
                y={H - padB - hv}
                width={bw * 0.36}
                height={hv}
                fill={CYAN}
                opacity="0.55"
              />
              <text x={x + bw / 2} y={H - padB + 14} textAnchor="middle" className="fill-mist/40" fontSize="10">
                {p.k}
              </text>
            </g>
          );
        })}
        <text x={W / 2} y={H - 6} textAnchor="middle" className="fill-mist/35" fontSize="10">
          {chart.copy.xlabel}
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-body text-[11px] text-mist/40">
        <span>
          <span className="mr-1.5 inline-block h-2 w-3 align-middle" style={{ background: MUTED }} />
          {t.events}
        </span>
        <span>
          <span
            className="mr-1.5 inline-block h-2 w-3 align-middle"
            style={{ background: CYAN, opacity: 0.55 }}
          />
          {t.value}
        </span>
        {chart.se_exceeds_effect ? (
          <span style={{ color: ROSE, opacity: 0.85 }}>{t.inconclusive}</span>
        ) : null}
      </div>
    </>
  );
}

// ── 計數：宇宙加寬 ─────────────────────────────────────────────────────
function Counts({ chart, t }: { chart: Chart; t: Labels }) {
  const rows = chart.series as CountRow[];
  const before = chart.before ?? 0;
  const after = chart.after ?? 0;
  const max = Math.max(after, 1);
  return (
    <div className="min-w-[420px]">
      <div className="flex items-end gap-6">
        <div>
          <div className="font-body text-[11px] text-mist/35">{chart.copy.before_label ?? t.before}</div>
          <div className="font-display text-3xl font-light text-mist/45">{before}</div>
        </div>
        <div className="pb-1 text-mist/25">→</div>
        <div>
          <div className="font-body text-[11px] text-mist/35">{chart.copy.after_label ?? t.after}</div>
          <div className="font-display text-3xl font-light" style={{ color: CYAN }}>
            {after}
          </div>
        </div>
        <div className="pb-1.5 font-body text-[11px] text-mist/30">{t.pairsUnit}</div>
      </div>
      <div className="mt-5 space-y-1.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <div className="w-44 shrink-0 truncate font-body text-[11px] text-mist/45">{r.name}</div>
            <div className="h-2 flex-1 rounded-sm bg-white/5">
              <div
                className="h-2 rounded-sm"
                style={{ width: `${(r.count / max) * 100}%`, background: CYAN, opacity: 0.5 }}
              />
            </div>
            <div className="w-8 shrink-0 text-right font-body text-[11px] text-mist/45">{r.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResearchCharts({ locale }: { locale: string }) {
  const t = locale === 'zh' ? L.zh : L.en;
  const charts = listResearchCharts(locale);
  if (!charts.length) return null; // 降級：沒有內容就整段不出，絕不丟錯
  return (
    <div className="mt-24">
      <div className="font-body text-[11px] uppercase tracking-[0.2em] text-iris-cyan/60">
        {t.eyebrow}
      </div>
      <h2 className="mt-3 font-display text-2xl font-light leading-snug text-mist">{t.title}</h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-mist/60">{t.lede}</p>

      {charts.map((c) => (
        <Frame key={c.id} chart={c} t={t}>
          {c.kind === 'slope' ? <Slope chart={c} t={t} /> : null}
          {c.kind === 'rank_slope' ? <RankSlope chart={c} t={t} /> : null}
          {c.kind === 'two_column' ? <TwoColumn chart={c} t={t} /> : null}
          {c.kind === 'bars' ? <Bars chart={c} t={t} /> : null}
          {c.kind === 'counts' ? <Counts chart={c} t={t} /> : null}
        </Frame>
      ))}

      <p className="mt-8 font-body text-[11px] text-mist/30">
        {t.updated} {researchChartsUpdated()}
      </p>
    </div>
  );
}
