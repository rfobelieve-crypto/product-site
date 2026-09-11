import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { pageAlternates } from '@/lib/seo';
import { getOnchainStatus } from '@/lib/onchain';

const COPY = {
  zh: {
    eyebrow: '鏈上量化',
    lede: '第五條研究線。還在錄資料，沒有任何績效可以報——這一頁講的是它為什麼存在，以及現在錄到哪裡。',
    whyTitle: '為什麼開這條線',
    why: [
      '這套系統連續三次嘗試回答同一個問題——「價格掃過一個位置之後，前方還有沒有被迫成交的單」——三次都失敗，而三次的失敗原因相同：中心化交易所不公開部位，所以只能用公開的聚合指標去推估。',
      '第一次用未平倉量加上假設的槓桿分布去推導清算位，結果那個指標被證明只是波動度的替身。第二次用大眾指標算出群眾的止損位置，結果它跟真實發生的強制平倉是反向排列的，九個標的沒有一個例外。第三次用多空比推擁擠程度，九個格子裡最好的那一格，把資料隨機打亂也有兩成機率做得到。',
      '永續去中心化交易所把這些直接公開：每個地址的部位、它的清算價、還掛著的止損單的觸發價。所以這條線的前提不是新的假設，是同一個假設換一個看得見的地方問。',
    ],
    recTitle: '現在錄什麼',
    rec: [
      ['逐地址部位與清算價', '每小時一次。這是唯一沒有任何替代來源的資料——沒有人存檔過歷史，所以停一小時就永久少一小時。'],
      ['真實的止損單', '還掛在場上的觸發單與它們的觸發價。這是前兩次只能用指標代理的那個量。'],
      ['全市場掛單簿', '兩側各二十檔，而且每一檔帶「這個價位有幾張單」——中心化交易所的公開資料不給這一欄，所以排隊位置從估計變成數得出來。'],
      ['全市場成交帶', '每一筆成交都帶雙方地址。它最大的價值不是成交本身，是讓我們認識的地址從抽樣收斂到接近完整。'],
    ],
    statusTitle: '狀態',
    honestTitle: '現在不能說什麼',
    honest: [
      '沒有績效、沒有回測、沒有判準。判準要等有幾週真實資料之後才寫——在不知道雜訊有多大的時候寫門檻，等於花幾個月累積一個註定沒有答案的樣本。這件事在這套系統上發生過，代價是一個跑了一個月卻從設計上就不可能有結論的扳機。',
      '可觀測性不等於有優勢。更好的資料也可能只是把「這個機制本來就很弱」量得更精確。差別在於現在這件事變成測得出來，而那是過去一年唯一真正卡住的東西。',
      '低競爭與低容量是同一件事。去效率低的地方的代價，就是那裡裝不下錢——這條要在談任何規模之前先算。',
    ],
    toMethod: '看驗證方法',
    toNoGo: '看被否決的假設',
    updated: '更新',
    labels: {
      venues: '永續場',
      markets: '市場',
      snapshots: '已錄快照',
      addresses: '已知地址',
      coverage: '未平倉覆蓋率',
      checks: '單位驗證',
    },
  },
  en: {
    eyebrow: 'On-chain quant',
    lede: 'The fifth research line. Still recording; there is no performance to report. This page is about why it exists and how far the recording has got.',
    whyTitle: 'Why this line exists',
    why: [
      'This system tried three times to answer one question — after price sweeps through a level, is there forced flow ahead of it — and failed three times for the same reason: centralised venues do not publish positions, so the quantity has to be proxied from public aggregates.',
      'The first attempt derived liquidation levels from open interest plus an assumed leverage distribution; the resulting measure turned out to be a stand-in for volatility. The second computed crowd stop locations from popular indicators; it was anti-located with where forced closures actually happened, with no exception across nine symbols. The third inferred crowding from long/short ratios; the best of nine cells was reachable by shuffling the data at random two times in ten.',
      'Perpetual decentralised venues publish all of it: every address’s position, its liquidation price, the trigger price of stop orders still resting. So this line is not a new hypothesis. It is the same hypothesis asked somewhere it can be seen.',
    ],
    recTitle: 'What is being recorded',
    rec: [
      ['Positions and liquidation prices, per address', 'Hourly. This is the only piece with no alternative source — nobody archives the history, so an hour missed is an hour lost permanently.'],
      ['Real stop orders', 'Resting trigger orders and their trigger prices — the quantity the two earlier attempts could only proxy with indicators.'],
      ['Full order books', 'Twenty levels each side, each carrying the number of orders at that price. Public centralised feeds omit that column, so queue position goes from estimated to counted.'],
      ['Full trade tape', 'Every print carries both counterparties. Its largest value is not the prints: it converges the set of known addresses from a sample towards completeness.'],
    ],
    statusTitle: 'Status',
    honestTitle: 'What cannot be claimed yet',
    honest: [
      'No performance, no backtest, no criteria. Criteria wait until weeks of real data exist — writing thresholds before the noise level is known means spending months accumulating a sample that cannot reach a conclusion. That happened here once, and it cost a trigger that ran for a month while being undecidable by construction.',
      'Observability is not an edge. Better data may simply measure a weak mechanism more precisely. The difference is that it becomes measurable at all, which was the one thing genuinely blocked for the past year.',
      'Low competition and low capacity are the same fact. The price of going where efficiency is low is that it holds little money — that has to be computed before any talk of size.',
    ],
    toMethod: 'How results are judged',
    toNoGo: 'Rejected hypotheses',
    updated: 'Updated',
    labels: {
      venues: 'venues',
      markets: 'markets',
      snapshots: 'snapshots',
      addresses: 'addresses known',
      coverage: 'open-interest coverage',
      checks: 'unit checks',
    },
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale === 'zh' ? 'zh' : 'en'];
  return {
    title: `${c.eyebrow} — flowbot`,
    description: c.lede,
    alternates: pageAlternates(locale, '/onchain'),
  };
}

export default async function OnchainPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[locale === 'zh' ? 'zh' : 'en'];
  const s = getOnchainStatus(locale);

  const stats: Array<[string, string]> = [
    [c.labels.venues, String(s.venues)],
    [c.labels.markets, String(s.markets)],
    [c.labels.snapshots, String(s.snapshots)],
    [c.labels.addresses, s.addresses.toLocaleString()],
    [c.labels.coverage,
      s.coveragePct == null ? '—' : `${s.coveragePct.toFixed(1)}%`],
    [c.labels.checks, `${s.checksPassed}/${s.checksTotal}`],
  ];

  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer px-6 pb-24 pt-32 sm:px-16">
        <div className="mx-auto max-w-3xl">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
            {c.eyebrow}
          </span>
          <h1 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
            {s.copy.name}
          </h1>
          <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-mist/60">
            {c.lede}
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-ink/40 p-5">
            <p className="font-body text-sm leading-relaxed text-mist/70">
              {s.copy.desc}
            </p>
            <p className="mt-3 font-body text-[11px] uppercase tracking-[0.2em] text-amber-300/70">
              {s.copy.stage}
            </p>
          </div>

          <section className="mt-12">
            <h2 className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet/80">
              {c.statusTitle}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {stats.map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/[0.08] bg-ink/60 px-4 py-3"
                >
                  <div className="font-display text-xl font-light text-iris-cyan tabular-nums">
                    {v}
                  </div>
                  <div className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-mist/45">
                    {k}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 font-body text-[11px] leading-relaxed text-mist/45">
              {s.copy.note}
            </p>
          </section>

          <section className="mt-14">
            <h2 className="font-display text-2xl font-light leading-tight">
              {c.whyTitle}
            </h2>
            {c.why.map((p) => (
              <p
                key={p.slice(0, 24)}
                className="mt-4 font-body text-sm leading-relaxed text-mist/65"
              >
                {p}
              </p>
            ))}
          </section>

          <section className="mt-14">
            <h2 className="font-display text-2xl font-light leading-tight">
              {c.recTitle}
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {c.rec.map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-ink/40 p-5"
                >
                  <h3 className="font-display text-base font-light text-mist">
                    {title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-mist/55">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-2xl border border-white/10 bg-ink/40 p-6">
            <h2 className="font-display text-xl font-light leading-snug text-mist">
              {c.honestTitle}
            </h2>
            {c.honest.map((p) => (
              <p
                key={p.slice(0, 24)}
                className="mt-3 font-body text-sm leading-relaxed text-mist/65"
              >
                {p}
              </p>
            ))}
          </section>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/method"
              className="font-body text-sm text-iris-cyan/80 transition-colors hover:text-iris-cyan"
            >
              {c.toMethod} →
            </Link>
            <Link
              href="/writeups"
              className="font-body text-sm text-mist/50 transition-colors hover:text-iris-cyan"
            >
              {c.toNoGo} →
            </Link>
          </div>

          <p className="mt-10 font-body text-[11px] text-mist/40">
            {c.updated} {s.updated} · {s.asofUtc} UTC
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
