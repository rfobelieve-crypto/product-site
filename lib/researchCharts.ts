import data from '@/content/research_charts.json';

// 研究圖表。真相源在 flow_system/assets/research_charts.json，而**那一份是
// 用 research/publish_research_charts.py 從做決定的那些結果檔生成的，不是
// 手寫的**——手抄到網站上的數字會漂，而且漂了沒有人會發現（這個 repo 家族
// 踩過：把既有數字搬到新地方顯示＝第二份實作，它會安靜地跟真正做決定的那個
// 不一致）。所以這一層**只做型別與語系挑選，不做任何算術**。
//
// 公開面規則同 method / research_nogo：只出百分比、方向、時間、計數；
// 不出美元、張數、帳戶權益、模型內部。產生端有一道正則守衛在擋金額樣式，
// 但這一層也不得自己算出任何金額。
//
// 降級契約與其他卡片一致：內容檔缺了就回空陣列，頁面少一段，絕不丟錯。

type Locale = 'zh' | 'en';

type CopyBase = {
  title: string;
  lede?: string;
  note?: string;
  xlabel?: string;
  ylabel?: string;
  unit?: string;
  colA?: string;
  colB?: string;
  before_label?: string;
  after_label?: string;
};

export type SlopePoint = { arm: string; first: number; second: number; flipped: boolean };
export type RankPoint = { name: string; first_rank: number; second_rank: number };
export type TwoColRow = { name: string; info: string; exec_: string };
export type BarPoint = { k: number; events_pct: number; value_x: number | null };
export type CountRow = { name: string; count: number };

export type Chart = {
  id: string;
  kind: 'slope' | 'rank_slope' | 'two_column' | 'bars' | 'counts';
  copy: CopyBase;
  series: unknown[];
  source: string;
  before?: number;
  after?: number;
  tickers?: number;
  se_exceeds_effect?: boolean;
};

type Raw = {
  updated?: string;
  charts?: Array<{
    id: string;
    kind: Chart['kind'];
    series: unknown[];
    source: string;
    before?: number;
    after?: number;
    tickers?: number;
    se_exceeds_effect?: boolean;
  } & Record<Locale, CopyBase>>;
};

export function listResearchCharts(locale: string): Chart[] {
  const l: Locale = locale === 'zh' ? 'zh' : 'en';
  const raw = (data as Raw).charts ?? [];
  return raw.map((c) => ({
    id: c.id,
    kind: c.kind,
    copy: c[l],
    series: c.series ?? [],
    source: c.source,
    before: c.before,
    after: c.after,
    tickers: c.tickers,
    se_exceeds_effect: c.se_exceeds_effect,
  }));
}

export function researchChartsUpdated(): string {
  return (data as Raw).updated ?? '';
}
