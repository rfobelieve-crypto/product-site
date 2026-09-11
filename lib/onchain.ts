import data from '@/content/onchain_status.json';

// 鏈上量化（第五條策略線，2026-09-11）的狀態卡。
//
// 真相源在 flow_system/assets/onchain_status.json，而那一份是
// research/hl/onchain_publish.py **產生**的，不是手寫的 —— 數字的真相源是
// 錄製器與驗證器自己寫的旗標。手抄一份到網站就是第二份實作，它會安靜地
// 跟真正的那個不一致（prereg 看板曾因此把 1127 顯示成 346）。
//
// 公開面規則同 research_nogo / method：只出百分比、方向、時間與計數。
// **不出美元金額**，連市場層級的未平倉名目也不出 —— 產生端有一道自曝檢查
// 會在內容含金額時直接讓發布失敗（反向證明過）。

type Locale = 'zh' | 'en';

export type OnchainCopy = {
  name: string;
  desc: string;
  stage: string;
  note: string;
};

export type OnchainStatus = {
  updated: string;
  asofUtc: string;
  stage: string;
  venues: number;
  markets: number;
  snapshots: number;
  addresses: number;
  coveragePct: number | null;   // null = 那一輪是部分掃描，不可發布
  checksPassed: number;
  checksTotal: number;
  recorderOk: boolean;
  verifyOk: boolean;
  tapeOk: boolean;
  copy: OnchainCopy;
};

export function getOnchainStatus(locale: string): OnchainStatus {
  const l: Locale = locale === 'zh' ? 'zh' : 'en';
  const d = data as Record<string, unknown>;
  const copy = (d[l] ?? d.en) as OnchainCopy;
  const num = (k: string) => Number(d[k] ?? 0);
  return {
    updated: String(d.updated ?? ''),
    asofUtc: String(d.asof_utc ?? ''),
    stage: String(d.stage ?? 'recording'),
    venues: num('venues'),
    markets: num('markets'),
    snapshots: num('snapshots'),
    addresses: num('addresses'),
    // **部分掃描的覆蓋率不顯示**：產生端（onchain_publish.py）在那種情況
    // 下會寫 null，因為一個被 --max-addr 人為截短的數字必然偏低，
    // 貼上網站就是用人為的低估去描述系統。
    coveragePct: d.coverage_pct == null ? null : num('coverage_pct'),
    checksPassed: num('checks_passed'),
    checksTotal: num('checks_total'),
    recorderOk: Boolean(d.recorder_ok),
    verifyOk: Boolean(d.verify_ok),
    tapeOk: Boolean(d.tape_ok),
    copy,
  };
}
