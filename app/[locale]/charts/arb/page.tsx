import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { Link } from '@/i18n/navigation';
import { getPreregBoard } from '@/lib/prereg';

// Line 4 (arbitrage) has no chart iframe — its whole public face is the
// recording clock. Progress numbers come from the same prereg-clocks feed
// as the board (single owning scorer on the research side; nothing here
// computes a verdict). Status chip is mandatory: 研究結論上牆必標狀態.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chartsPage.arb' });
  return { title: `${t('title')} — flowbot`, description: t('body') };
}

export default async function ArbChartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'chartsPage' });
  const board = await getPreregBoard();
  const clock = board?.open.find((c) => c.id === '0.75') ?? null;
  const pct =
    clock?.n != null && clock?.gate_n
      ? Math.min(100, (clock.n / clock.gate_n) * 100)
      : 0;
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pb-24 pt-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <Link
            href="/charts"
            className="font-body text-xs uppercase tracking-[0.25em] text-mist/50 transition-colors hover:text-mist"
          >
            ← {t('backToCharts')}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-light">{t('arb.title')}</h1>
            <span className="rounded-full border border-dashed border-amber-400/40 px-3 py-1 font-body text-[10px] uppercase tracking-[0.2em] text-amber-300/80">
              {t('arb.status')}
            </span>
          </div>
          <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-mist/60">
            {t('arb.body')}
          </p>
          <p className="mt-3 max-w-2xl font-body text-xs leading-relaxed text-mist/45">
            {t('arb.pageNote')}
          </p>

          <div className="mt-8 rounded-xl border border-white/[0.08] bg-ink/70 p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-body text-[11px] uppercase tracking-[0.2em] text-iris-violet/80">
                {t('arb.progressTitle')}
              </h2>
              <span className="font-body text-[11px] text-mist/45">
                {t('arb.battlefield')}：{t('arb.battlefieldActive')}
              </span>
            </div>
            {clock ? (
              <>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-iris-cyan/60"
                    style={{ width: `${pct.toFixed(1)}%` }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 font-body text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-mist/40">
                      {t('arb.minutes')}
                    </div>
                    <div className="mt-1 tabular-nums text-mist">
                      {clock.n?.toLocaleString() ?? '—'}
                      <span className="text-mist/40"> / {clock.gate_n?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-mist/40">
                      {t('arb.daysLabel')}
                    </div>
                    <div className="mt-1 tabular-nums text-mist">
                      {clock.days.toFixed(1)}
                      <span className="text-mist/40"> / {clock.gate_days}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-mist/40">
                      {t('arb.verdictDate')}
                    </div>
                    <div className="mt-1 tabular-nums text-mist">2026-09-04</div>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 font-body text-xs text-mist/40">—</p>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.08] bg-ink/70 p-5">
            <h2 className="font-body text-[11px] uppercase tracking-[0.2em] text-iris-violet/80">
              {t('arb.criteriaTitle')}
            </h2>
            <ul className="mt-3 space-y-2 font-body text-sm text-mist/60">
              <li>· {t('arb.criteria1')}</li>
              <li>· {t('arb.criteria2')}</li>
              <li>· {t('arb.criteria3')}</li>
              <li className="text-mist/40">· {t('arb.criteriaFail')}</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
