import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { pageAlternates } from '@/lib/seo';
import {
  listPrinciples,
  methodClosing,
  methodCounts,
  methodUpdated,
} from '@/lib/method';

const COPY = {
  zh: {
    eyebrow: '驗證方法',
    title: '這裡最值錢的東西不是策略，是判斷策略真假的方式。',
    lede:
      '一年下來，這套系統上通過所有檢定並真的進了生產的東西很少，被資料否決的很多。下面五條是那些否決教出來的規矩——每一條都配一個真實發生過的案例，包括幾次差一點就把假的東西當成真的。',
    statRejected: '條被否決的假設已存檔',
    statWriteups: '篇拆解文章',
    caseLabel: '實際案例',
    updated: '更新',
    toNoGo: '看全部被否決的假設',
    toSystem: '看系統架構',
  },
  en: {
    eyebrow: 'Method',
    title: 'The most valuable thing here is not a strategy. It is how a strategy is judged.',
    lede:
      'Over a year, very little on this system passed every check and reached production; a great deal was killed by the data. The five rules below are what those rejections taught — each with a real case attached, including the times something false was nearly accepted as true.',
    statRejected: 'rejected hypotheses on file',
    statWriteups: 'written post-mortems',
    caseLabel: 'What happened',
    updated: 'Updated',
    toNoGo: 'See every rejected hypothesis',
    toSystem: 'See the architecture',
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
    alternates: pageAlternates(locale, '/method'),
  };
}

export default async function MethodPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[locale === 'zh' ? 'zh' : 'en'];
  const principles = listPrinciples(locale);
  const closing = methodClosing(locale);
  const counts = methodCounts(locale);

  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer px-6 pb-24 pt-32 sm:px-16">
        <div className="mx-auto max-w-3xl">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
            {c.eyebrow}
          </span>
          <h1 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
            {c.title}
          </h1>
          <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-mist/60">
            {c.lede}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-ink/40 px-5 py-4">
              <div className="font-display text-2xl font-light text-iris-cyan">
                {counts.rejected}
              </div>
              <div className="mt-1 font-body text-[11px] text-mist/50">
                {c.statRejected}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink/40 px-5 py-4">
              <div className="font-display text-2xl font-light text-iris-cyan">
                {counts.writeups}
              </div>
              <div className="mt-1 font-body text-[11px] text-mist/50">
                {c.statWriteups}
              </div>
            </div>
          </div>

          <ol className="mt-14 flex flex-col gap-4">
            {principles.map((p, i) => (
              <li
                key={p.id}
                className="rounded-2xl border border-white/10 bg-ink/40 p-5"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-sm font-light text-iris-cyan/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-lg font-light leading-snug text-mist">
                    {p.title}
                  </h2>
                </div>
                <p className="mt-3 font-body text-sm leading-relaxed text-mist/65">
                  {p.body}
                </p>
                <div className="mt-4 border-l border-iris-cyan/25 pl-4">
                  <div className="font-body text-[10px] uppercase tracking-[0.25em] text-iris-cyan/60">
                    {c.caseLabel}
                  </div>
                  <p className="mt-2 font-body text-sm leading-relaxed text-mist/50">
                    {p.case}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <section className="mt-20 rounded-2xl border border-white/10 bg-ink/40 p-6">
            <h2 className="font-display text-xl font-light leading-snug text-mist">
              {closing.title}
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-mist/65">
              {closing.body}
            </p>
            <p className="mt-4 font-body text-[11px] leading-relaxed text-mist/40">
              {closing.note}
            </p>
          </section>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/writeups"
              className="font-body text-sm text-iris-cyan/80 transition-colors hover:text-iris-cyan"
            >
              {c.toNoGo} →
            </Link>
            <Link
              href="/system"
              className="font-body text-sm text-mist/50 transition-colors hover:text-iris-cyan"
            >
              {c.toSystem} →
            </Link>
          </div>

          <p className="mt-10 font-body text-[11px] text-mist/40">
            {c.updated} {methodUpdated()}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
