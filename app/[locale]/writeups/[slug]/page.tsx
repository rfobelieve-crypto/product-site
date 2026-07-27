import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { pageAlternates } from '@/lib/seo';
import { allWriteupParams, excerpt, getWriteup } from '@/lib/writeups';

const COPY = {
  zh: { back: '← 研究筆記', disclaimer: '本文分享個人開發經驗，非投資建議。' },
  en: {
    back: '← Write-ups',
    disclaimer: 'Personal engineering experience, not investment advice.',
  },
} as const;

export function generateStaticParams() {
  return allWriteupParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const w = getWriteup(slug, locale);
  if (!w) return {};
  return {
    title: `${w.title} — flowbot`,
    description: w.subtitle || excerpt(w.blocks, 150),
    alternates: pageAlternates(locale, `/writeups/${slug}`),
  };
}

export default async function WriteupPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const w = getWriteup(slug, locale);
  if (!w) notFound();
  const c = COPY[locale === 'zh' ? 'zh' : 'en'];

  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer px-6 pb-24 pt-32 sm:px-16">
        <article className="mx-auto max-w-2xl">
          <Link
            href="/writeups"
            className="font-body text-xs text-mist/45 transition-colors hover:text-iris-cyan"
          >
            {c.back}
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[11px] text-mist/45">
            <time dateTime={w.date}>{w.date}</time>
            {w.tags.map((t) => (
              <span key={t} className="text-iris-cyan/60">
                {t}
              </span>
            ))}
          </div>

          <h1 className="mt-3 font-display text-3xl font-light leading-tight sm:text-4xl">
            {w.title}
          </h1>
          {w.subtitle && (
            <p className="mt-4 font-body text-base leading-relaxed text-mist/60">
              {w.subtitle}
            </p>
          )}

          {/* Intrinsic sizing, not a fixed 16:9 frame: these covers range from
              a wide neon banner to a tall stat card, and letterboxing the tall
              ones inside 16:9 leaves a large empty void (they are dark-on-dark,
              so the padding reads as a broken image). */}
          {w.cover && (
            <Image
              src={`/writeups/${w.cover}`}
              alt=""
              width={1376}
              height={768}
              sizes="(max-width: 768px) 100vw, 672px"
              className="mt-8 h-auto w-full rounded-2xl border border-white/10"
              priority
            />
          )}

          <div className="mt-10 flex flex-col gap-5">
            {w.blocks.map((b, i) =>
              b.type === 'h' ? (
                <h2
                  key={i}
                  className="mt-4 font-display text-xl font-light leading-snug text-mist"
                >
                  {b.text}
                </h2>
              ) : (
                <p
                  key={i}
                  className="font-body text-[15px] leading-[1.9] text-mist/70"
                >
                  {b.text}
                </p>
              ),
            )}
          </div>

          <p className="mt-14 border-t border-white/10 pt-6 font-body text-xs text-mist/40">
            {c.disclaimer}
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
