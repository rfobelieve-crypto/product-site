import data from '@/content/research_nogo.json';

// 研究筆記的另一半：陣亡名冊。每一條是一個預註冊過、跑過、被否決的假設。
// 真相源在 flow_system/assets/research_nogo.json（手工策展，從 TODO.md 的
// 判決節摘出），複製到這裡。公開面規則同 writeups：只出百分比、方向、時間；
// 不出美元、張數、模型內部。狀態固定為 NO-GO / FAIL / PARK / 無效判決 /
// 過閘（僅零費率）——「已陣亡」的東西上牆必須標狀態，不能讓頁面暗示它生效。

export type NoGoItem = {
  date: string;
  line: string;
  status: string;
  title: string;
  hypothesis: string;
  why: string;
  rules_out: string;
};

export function listNoGo(): NoGoItem[] {
  const items = (data as { items: NoGoItem[] }).items ?? [];
  return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function noGoUpdated(): string {
  return (data as { updated?: string }).updated ?? '';
}
