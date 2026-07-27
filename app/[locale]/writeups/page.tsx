import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { pageAlternates } from '@/lib/seo';
import { excerpt, listWriteups } from '@/lib/writeups';

const COPY = {
  zh: {
    eyebrow: '研究筆記',
    title: '建這套系統時，我學到的東西。',
    lede: '每一篇都來自這套系統上實際發生的事：一個沒生效的風控、一個在偷看答案的回測、一個永遠不會成立的判斷式。主題是方法與驗證，不是行情，所以就算你不做加密貨幣也讀得下去。',
    empty: '目前沒有這個語言的文章。',
    readMore: '閱讀',
  },
  en: {
    eyebrow: 'Write-ups',
    title: 'What building this system taught me.',
    lede: 'Every piece here comes from something that actually happened in this system: a risk check that never ran, a backtest that was peeking at the answer, a condition that could never be true. They are about method and validation rather than markets, so they hold up whatever you trade.',
    empty: 'No articles in this language yet.',
    readMore: 'Read',
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
    alternates: pageAlternates(locale, '/writeups'),
  };
}

export default async function WriteupsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[locale === 'zh' ? 'zh' : 'en'];
  const posts = listWriteups(locale);

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

          {posts.length === 0 ? (
            <p className="mt-16 font-body text-sm text-mist/50">{c.empty}</p>
          ) : (
            <div className="mt-12 flex flex-col gap-4">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/writeups/${p.slug}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink/40 p-5 transition-colors hover:border-iris-cyan/40 sm:flex-row sm:items-start sm:gap-6"
                >
                  {p.cover && (
                    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-void sm:w-44">
                      <Image
                        src={`/writeups/${p.cover}`}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 176px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[11px] text-mist/45">
                      <time dateTime={p.date}>{p.date}</time>
                      {p.tags.map((t) => (
                        <span key={t} className="text-iris-cyan/60">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h2 className="mt-2 font-display text-lg font-light leading-snug text-mist transition-colors group-hover:text-iris-cyan">
                      {p.title}
                    </h2>
                    <p className="mt-2 font-body text-sm leading-relaxed text-mist/55">
                      {excerpt(p.blocks)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
