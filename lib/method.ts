import data from '@/content/method.json';
import { listNoGo } from '@/lib/research';
import { listWriteups } from '@/lib/writeups';

// 驗證方法論頁。真相源在 flow_system/assets/method.json（手工策展），複製到
// 這裡。公開面規則同 research_nogo：只出百分比、方向、時間；不出美元、張數、
// 模型內部。
//
// 每一條規矩都配一個真實發生過的案例——沒有案例的規矩不上牆，那會變成口號。
//
// **計數一律從既有內容檔算出來，不寫死**：陣亡條數與文章數已經各有一個
// 真相源，在這裡複製一份數字就是第二份實作，它會安靜地跟真正的那個不一致
// （這個 repo 家族踩過這個坑）。

type Locale = 'zh' | 'en';

type Copy = { title: string; body: string; case: string };

export type Principle = { id: string } & Copy;

export function listPrinciples(locale: string): Principle[] {
  const l: Locale = locale === 'zh' ? 'zh' : 'en';
  const raw = (data as { principles?: Array<{ id: string } & Record<Locale, Copy>> })
    .principles ?? [];
  return raw.map((p) => ({ id: p.id, ...p[l] }));
}

export function methodClosing(locale: string): { title: string; body: string; note: string } {
  const l: Locale = locale === 'zh' ? 'zh' : 'en';
  const c = (data as {
    closing?: Record<Locale, { title: string; body: string; note: string }>;
  }).closing;
  return c ? c[l] : { title: '', body: '', note: '' };
}

export function methodUpdated(): string {
  return (data as { updated?: string }).updated ?? '';
}

/** 證據計數。來源是既有的內容檔，不是寫死的數字。 */
export function methodCounts(locale: string): { rejected: number; writeups: number } {
  return { rejected: listNoGo().length, writeups: listWriteups(locale).length };
}
