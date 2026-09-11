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
// 盡量以圖表輔助顯示說明」，接著要求「圖表能不能像文章中那樣專業一點」。
//
// 所以這一版的版式直接照 /writeups 那幾張圖的文法來（那是這個專案已經定型
// 的家規），每一張圖都要有這五件事：
//
//   1. **真的座標軸** —— 軸線、刻度、刻度值、軸標題。沒有刻度的長條圖等於
//      要讀者相信我的排版；有刻度他可以自己驗。
//   2. **數值標籤要大**（~17px，不是 10px），而且**用顏色表態**：
//      青＝撐住了，紅＝翻號／變差。一眼要看得出結論。
//   3. **灰色的方法副標**（`sample`）——樣本數、期間、怎麼切的。
//      文章版每一張都有，因為「這張圖是拿什麼量的」跟圖一樣重要。
//   4. **琥珀色的註解**（`callout`）放在圖裡面，講這張圖要人看到什麼。
//   5. **參考線要標示**（零線、1.00×、硬幣線），否則讀者沒有錨點。
//
// 三條這個元件要守的規矩（沒變）：
//  1. **不做任何算術。** 每個數字都由 research/publish_research_charts.py
//     從做決定的那份結果檔生成；在這裡算一次就是第二份實作。
//     `sample` 與 `callout` 的文字也是那支腳本產生的，不在這裡手寫。
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
    baseline: '不等待 = 100',
    rankAxis: '名次（1 = 最好）',
    countAxis: '配對數',
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
    baseline: 'no wait = 100',
    rankAxis: 'Rank (1 = best)',
    countAxis: 'Pairs',
  },
} as const;

// `as const` 讓中英兩組成為不同的**字面型別**，直接用 (typeof L)['zh']
// 當參數型別會讓英文那組不相容。把它放寬成「同樣的鍵、值是 string」。
type Labels = { [K in keyof (typeof L)['zh']]: string };

const CYAN = '#4fd1c5';
const ROSE = '#f08a8a';
const AMBER = '#e0b062';
const AXIS = 'rgba(226,232,240,0.22)';
const MUTED = 'rgba(226,232,240,0.28)';

// 產生端寫的是 Markdown 粗體與行內碼（那份 JSON 也給別的地方吃）。
// 之前這裡直接把字串塞進 <p>，於是頁面上真的印出 `**…**` 這六個字元——
// 「像文章一樣專業」的第一步是不要把標記語言漏到畫面上。
function Md({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((s, i) => {
        if (s.startsWith('**') && s.endsWith('**')) {
          return (
            <strong key={i} className="font-medium text-mist/85">
              {s.slice(2, -2)}
            </strong>
          );
        }
        if (s.startsWith('`') && s.endsWith('`')) {
          return (
            <code key={i} className="text-iris-cyan/75">
              {s.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{s}</span>;
      })}
    </>
  );
}

// 「好看的刻度」：把一個區間切成 1/2/2.5/5 × 10^n 的格子。沒有這個，
// 軸上會出現 -3.127 這種刻度值，看起來就是沒有人排過版。
function niceTicks(lo: number, hi: number, target = 6): number[] {
  if (!(hi > lo)) return [lo];
  const mag = Math.pow(10, Math.floor(Math.log10(hi - lo)) - 1);
  // 選「格數最接近 target」的那個 step，而不是套一條 if 階梯——階梯會在
  // 邊界上給出三格的軸（實測：-3.1~+3.6 只畫出 -2/0/+2），看起來像沒排版。
  let step = mag;
  let bestErr = Infinity;
  for (const m of [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]) {
    const s = mag * m;
    const err = Math.abs((hi - lo) / s - target);
    if (err < bestErr) {
      bestErr = err;
      step = s;
    }
  }
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) {
    const r = Math.round(v / step) * step;
    out.push(Math.abs(r) < step * 1e-9 ? 0 : Number(r.toFixed(6)));
  }
  return out;
}

// 圖裡的琥珀色註解。文章版是右上角、右對齊、一到兩行。
function Callout({ text, x, y }: { text: string; x: number; y: number }) {
  const lines = text.split('\n');
  return (
    <text x={x} y={y} textAnchor="end" fontSize="12.5" fill={AMBER} opacity="0.85">
      {lines.map((ln, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 17}>
          {ln}
        </tspan>
      ))}
    </text>
  );
}

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
    <section className="mt-14 rounded-2xl border border-white/10 bg-ink/40 p-6 sm:p-8">
      <h3 className="font-display text-xl font-light leading-snug text-mist">
        {chart.copy.title}
      </h3>
      {chart.copy.sample ? (
        <p className="mt-2 font-body text-[12px] text-mist/40">{chart.copy.sample}</p>
      ) : null}
      {chart.copy.lede ? (
        <p className="mt-4 max-w-3xl font-body text-sm leading-relaxed text-mist/65">
          <Md text={chart.copy.lede} />
        </p>
      ) : null}
      <div className="mt-7 overflow-x-auto">{children}</div>
      {chart.copy.note ? (
        <p className="mt-6 max-w-3xl border-l border-white/10 pl-4 font-body text-[13px] leading-relaxed text-mist/55">
          <Md text={chart.copy.note} />
        </p>
      ) : null}
      <p className="mt-5 font-body text-[11px] text-mist/30">
        {t.source}: <code className="text-mist/40">{chart.source}</code>
      </p>
    </section>
  );
}

// 標籤避讓。兩個值只差一點點（後半 -2.201 vs -2.214）時，把文字各畫在自己的
// y 上會**疊成一團，看不出那是兩條線**——而這張圖的整個論點就是「六條裡有
// 五條翻號」，讀者數不出條數，這張圖就沒有作用。做法：照 y 排序後由上往下
// 推，強制至少相隔 gap 像素。**圓點與線仍然畫在真實位置，被推開的只有文字**，
// 所以這裡動的是像素不是數字（這個元件不做算術）。
function declutter(ys: number[], lo: number, hi: number, gap = 16): number[] {
  const out = new Array<number>(ys.length);
  const order = ys.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  let prev = -Infinity;
  for (const { v, i } of order) {
    const placed = Math.max(v, prev + gap);
    out[i] = placed;
    prev = placed;
  }
  // 往下推可能推出畫布；整組上移，再夾回上緣。
  const overflow = prev - hi;
  if (overflow > 0) for (let i = 0; i < out.length; i += 1) out[i] -= overflow;
  let floorY = lo;
  for (const { i } of order) {
    out[i] = Math.max(out[i], floorY);
    floorY = out[i] + gap;
  }
  return out;
}

const W = 760;

// ── 斜線圖：前半 -> 後半 ────────────────────────────────────────────────
function Slope({ chart, t }: { chart: Chart; t: Labels }) {
  const pts = chart.series as SlopePoint[];
  if (!pts.length) return null;
  const vals = pts.flatMap((p) => [p.first, p.second]);
  const lo = Math.min(...vals, 0);
  const hi = Math.max(...vals, 0);
  const H = 380;
  const axX = 86; // y 軸線
  const colA = 210; // 前半那一欄
  const colB = W - 170; // 後半那一欄
  const top = 78;
  const bot = H - 58;
  const y = (v: number) => bot - ((v - lo) / (hi - lo || 1)) * (bot - top);
  const ticks = niceTicks(lo, hi);
  const labA = declutter(pts.map((p) => y(p.first)), top - 10, bot);
  const labB = declutter(pts.map((p) => y(p.second)), top - 10, bot);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img">
      {/* y 軸：刻度網格 + 刻度值 + 旋轉的軸標題 */}
      {ticks.map((v) => (
        <g key={v}>
          <line
            x1={axX}
            y1={y(v)}
            x2={W - 24}
            y2={y(v)}
            stroke={v === 0 ? MUTED : AXIS}
            strokeDasharray={v === 0 ? undefined : '2 6'}
            strokeWidth={v === 0 ? 1 : 0.8}
          />
          <text
            x={axX - 8}
            y={y(v) + 4}
            textAnchor="end"
            fontSize="11"
            className="fill-mist/40"
          >
            {v > 0 ? `+${v}` : v}
          </text>
        </g>
      ))}
      <line x1={axX} y1={top - 14} x2={axX} y2={bot} stroke={AXIS} />
      {chart.copy.unit ? (
        <text
          transform={`rotate(-90 18 ${(top + bot) / 2})`}
          x={18}
          y={(top + bot) / 2}
          textAnchor="middle"
          fontSize="12"
          className="fill-mist/40"
        >
          {chart.copy.unit}
        </text>
      ) : null}

      {/* 欄標題放在上面（文章版的兩欄圖也是這樣） */}
      <text x={colA} y={38} textAnchor="middle" fontSize="12" className="fill-mist/50">
        {chart.copy.xlabel ?? t.first}
      </text>
      <text x={colB} y={38} textAnchor="middle" fontSize="12" className="fill-mist/50">
        {chart.copy.ylabel ?? t.second}
      </text>
      <line x1={colA - 46} y1={48} x2={colA + 46} y2={48} stroke={AXIS} />
      <line x1={colB - 46} y1={48} x2={colB + 46} y2={48} stroke={AXIS} />

      {pts.map((p, i) => {
        const col = p.flipped ? ROSE : CYAN;
        return (
          <g key={p.arm}>
            <line
              x1={colA}
              y1={y(p.first)}
              x2={colB}
              y2={y(p.second)}
              stroke={col}
              strokeWidth={p.flipped ? 1.8 : 1.4}
              opacity={p.flipped ? 0.85 : 0.5}
            />
            <circle cx={colA} cy={y(p.first)} r="3.5" fill={col} opacity="0.95" />
            <circle cx={colB} cy={y(p.second)} r="3.5" fill={col} opacity="0.95" />
            <polyline
              points={`${colA - 7},${y(p.first)} ${colA - 14},${labA[i]} ${colA - 19},${labA[i]}`}
              fill="none"
              stroke={col}
              strokeWidth="0.7"
              opacity="0.3"
            />
            <text x={colA - 23} y={labA[i] + 4} textAnchor="end" fontSize="12.5" fill={col} opacity="0.85">
              {p.arm}
            </text>
            <polyline
              points={`${colB + 7},${y(p.second)} ${colB + 14},${labB[i]} ${colB + 19},${labB[i]}`}
              fill="none"
              stroke={col}
              strokeWidth="0.7"
              opacity="0.3"
            />
            <text x={colB + 23} y={labB[i] + 6} fontSize="17" fontWeight="500" fill={col}>
              {p.second > 0 ? `+${p.second.toFixed(2)}` : p.second.toFixed(2)}
            </text>
          </g>
        );
      })}

      {chart.copy.callout ? <Callout text={chart.copy.callout} x={W - 24} y={H - 24} /> : null}
    </svg>
  );
}

// ── 名次斜線圖 ─────────────────────────────────────────────────────────
function RankSlope({ chart, t }: { chart: Chart; t: Labels }) {
  const pts = chart.series as RankPoint[];
  if (!pts.length) return null;
  const n = pts.length;
  const H = 400;
  const axX = 78;
  const colA = 190;
  const colB = W - 190;
  const top = 78;
  const bot = H - 64;
  const y = (r: number) => top + ((r - 1) / (n - 1 || 1)) * (bot - top);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img">
      {Array.from({ length: n }, (_, i) => i + 1).map((r) => (
        <g key={r}>
          <line x1={axX} y1={y(r)} x2={W - 24} y2={y(r)} stroke={AXIS} strokeDasharray="2 6" strokeWidth="0.7" />
          <text x={axX - 8} y={y(r) + 4} textAnchor="end" fontSize="11" className="fill-mist/40">
            {r}
          </text>
        </g>
      ))}
      <line x1={axX} y1={top - 14} x2={axX} y2={bot + 14} stroke={AXIS} />
      <text
        transform={`rotate(-90 18 ${(top + bot) / 2})`}
        x={18}
        y={(top + bot) / 2}
        textAnchor="middle"
        fontSize="12"
        className="fill-mist/40"
      >
        {t.rankAxis}
      </text>

      <text x={colA} y={38} textAnchor="middle" fontSize="12" className="fill-mist/50">
        {chart.copy.xlabel}
      </text>
      <text x={colB} y={38} textAnchor="middle" fontSize="12" className="fill-mist/50">
        {chart.copy.ylabel}
      </text>
      <line x1={colA - 46} y1={48} x2={colA + 46} y2={48} stroke={AXIS} />
      <line x1={colB - 46} y1={48} x2={colB + 46} y2={48} stroke={AXIS} />

      {pts.map((p) => {
        const worse = p.second_rank > p.first_rank;
        const col = worse ? ROSE : CYAN;
        return (
          <g key={p.name}>
            <line
              x1={colA}
              y1={y(p.first_rank)}
              x2={colB}
              y2={y(p.second_rank)}
              stroke={col}
              strokeWidth="1.5"
              opacity={worse ? 0.75 : 0.5}
            />
            <circle cx={colA} cy={y(p.first_rank)} r="3.5" fill={col} opacity="0.95" />
            <circle cx={colB} cy={y(p.second_rank)} r="3.5" fill={col} opacity="0.95" />
            <text x={colA - 12} y={y(p.first_rank) + 5} textAnchor="end" fontSize="13.5" fill={col} opacity="0.85">
              {p.name}
            </text>
            <text x={colB + 12} y={y(p.second_rank) + 5} fontSize="13.5" fill={col} opacity="0.85">
              {p.name}
            </text>
          </g>
        );
      })}

      {chart.copy.callout ? <Callout text={chart.copy.callout} x={W - 24} y={H - 26} /> : null}
    </svg>
  );
}

// ── 兩欄：資訊層 vs 執行層 ──────────────────────────────────────────────
function TwoColumn({ chart }: { chart: Chart }) {
  const rows = chart.series as TwoColRow[];
  return (
    <table className="w-full min-w-[560px] border-collapse font-body text-[13px]">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wider">
          <th className="pb-3 pr-4 font-normal text-mist/35" />
          <th className="pb-3 pr-4 font-normal" style={{ color: CYAN, opacity: 0.7 }}>
            {chart.copy.colA}
          </th>
          <th className="pb-3 font-normal" style={{ color: ROSE, opacity: 0.75 }}>
            {chart.copy.colB}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-t border-white/5 align-top">
            <td className="py-3 pr-4 text-mist/70">{r.name}</td>
            <td className="py-3 pr-4" style={{ color: CYAN, opacity: 0.8 }}>
              {r.info}
            </td>
            <td className="py-3" style={{ color: ROSE, opacity: 0.85 }}>
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
  const H = 380;
  const axX = 66;
  const top = 78;
  const bot = H - 74;
  const band = (W - axX - 28) / pts.length;
  const bw = band * 0.34;
  const maxV = Math.max(...pts.map((p) => Math.max(p.events_pct, (p.value_x ?? 0) * 100)), 100);
  const y = (v: number) => bot - (v / (maxV * 1.06)) * (bot - top);
  const ticks = niceTicks(0, maxV * 1.06, 4);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={axX} y1={y(v)} x2={W - 24} y2={y(v)} stroke={AXIS} strokeDasharray="2 6" strokeWidth="0.7" />
            <text x={axX - 8} y={y(v) + 4} textAnchor="end" fontSize="11" className="fill-mist/40">
              {v}
            </text>
          </g>
        ))}
        {/* 兩個系列都是「相對不等待」的比值，所以 100 就是不等待本身。
            沒有這條線，讀者看到的是一排沒有刻度的長條，分不出哪幾格其實
            比不等待還差——而那正是這張圖要講的事。 */}
        <line x1={axX} y1={y(100)} x2={W - 24} y2={y(100)} stroke={MUTED} strokeDasharray="5 4" />
        <text x={W - 26} y={y(100) - 7} textAnchor="end" fontSize="11.5" className="fill-mist/45">
          {t.baseline}
        </text>
        <line x1={axX} y1={top - 14} x2={axX} y2={bot} stroke={AXIS} />
        <line x1={axX} y1={bot} x2={W - 24} y2={bot} stroke={AXIS} />

        {pts.map((p, i) => {
          const cx = axX + band * (i + 0.5);
          const vx = (p.value_x ?? 0) * 100;
          return (
            <g key={p.k}>
              <rect x={cx - bw - 3} y={y(p.events_pct)} width={bw} height={bot - y(p.events_pct)} fill={MUTED} />
              <rect x={cx + 3} y={y(vx)} width={bw} height={bot - y(vx)} fill={CYAN} opacity="0.5" />
              <text
                x={cx + 3 + bw / 2}
                y={y(vx) - 8}
                textAnchor="middle"
                fontSize="14"
                fontWeight="500"
                fill={CYAN}
                opacity="0.9"
              >
                {(p.value_x ?? 0).toFixed(2)}×
              </text>
              <text x={cx} y={bot + 20} textAnchor="middle" fontSize="12.5" className="fill-mist/55">
                {p.k}
              </text>
              <text x={cx} y={bot + 36} textAnchor="middle" fontSize="11" className="fill-mist/30">
                {p.events_pct}%
              </text>
            </g>
          );
        })}
        <text x={(axX + W - 24) / 2} y={H - 10} textAnchor="middle" fontSize="12" className="fill-mist/40">
          {chart.copy.xlabel}
        </text>
        {chart.copy.callout ? <Callout text={chart.copy.callout} x={W - 24} y={top - 30} /> : null}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-body text-[11.5px] text-mist/45">
        <span>
          <span className="mr-1.5 inline-block h-2 w-3 align-middle" style={{ background: MUTED }} />
          {t.events}
        </span>
        <span>
          <span
            className="mr-1.5 inline-block h-2 w-3 align-middle"
            style={{ background: CYAN, opacity: 0.5 }}
          />
          {t.value}
        </span>
        {chart.se_exceeds_effect ? (
          <span
            className="rounded-full px-2.5 py-0.5"
            style={{ color: ROSE, border: `1px solid ${ROSE}55` }}
          >
            {t.inconclusive}
          </span>
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
  const H = 64 + rows.length * 40;
  const axX = 168;
  const max = Math.max(...rows.map((r) => r.count), 1);
  const ticks = niceTicks(0, max, 4);
  const bot = H - 48; // 刻度值在 bot+16、軸標題在 H-6，兩者要隔得開
  const band = (bot - 14) / rows.length;
  const x = (v: number) => axX + (v / (max * 1.1)) * (W - axX - 56);
  return (
    <div className="min-w-[560px]">
      <div className="flex items-end gap-7">
        <div>
          <div className="font-body text-[11.5px] text-mist/35">
            {chart.copy.before_label ?? t.before}
          </div>
          <div className="font-display text-4xl font-light text-mist/40">{before}</div>
        </div>
        <div className="pb-2 text-xl text-mist/25">→</div>
        <div>
          <div className="font-body text-[11.5px] text-mist/35">
            {chart.copy.after_label ?? t.after}
          </div>
          <div className="font-display text-4xl font-light" style={{ color: CYAN }}>
            {after}
          </div>
        </div>
        <div className="pb-2.5 font-body text-[11.5px] text-mist/30">{t.pairsUnit}</div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 w-full" role="img">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={8} x2={x(v)} y2={bot} stroke={AXIS} strokeDasharray="2 6" strokeWidth="0.7" />
            <text x={x(v)} y={bot + 16} textAnchor="middle" fontSize="11" className="fill-mist/40">
              {v}
            </text>
          </g>
        ))}
        <line x1={axX} y1={8} x2={axX} y2={bot} stroke={AXIS} />
        {rows.map((r, i) => {
          const cy = 14 + band * (i + 0.5);
          return (
            <g key={r.name}>
              <text x={axX - 10} y={cy + 4} textAnchor="end" fontSize="12.5" className="fill-mist/55">
                {r.name}
              </text>
              <rect x={axX} y={cy - 9} width={Math.max(x(r.count) - axX, 1)} height={18} fill={CYAN} opacity="0.42" rx="2" />
              <text x={x(r.count) + 10} y={cy + 5} fontSize="15" fontWeight="500" fill={CYAN} opacity="0.9">
                {r.count}
              </text>
            </g>
          );
        })}
        <text x={(axX + W - 56) / 2} y={H - 6} textAnchor="middle" fontSize="12" className="fill-mist/40">
          {t.countAxis}
        </text>
      </svg>

      {chart.copy.callout ? (
        <p className="mt-4 font-body text-[12.5px] leading-relaxed" style={{ color: AMBER, opacity: 0.85 }}>
          {chart.copy.callout}
        </p>
      ) : null}
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
          {c.kind === 'two_column' ? <TwoColumn chart={c} /> : null}
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
