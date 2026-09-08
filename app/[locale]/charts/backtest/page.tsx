import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { BacktestChart } from '@/components/sections/BacktestChart';
import { RecomputeNotice } from '@/components/sections/RecomputeNotice';
import { Footer } from '@/components/sections/Footer';
import { Link } from '@/i18n/navigation';
import { BACKTEST_CHART_URL, CONJ_BACKTEST_CHART_URL } from '@/lib/charts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chartsPage.backtest' });
  return { title: `${t('title')} — flowbot`, description: t('body') };
}

export default async function BacktestChartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'chartsPage' });
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pb-24 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <Link
            href="/charts"
            className="font-body text-xs uppercase tracking-[0.25em] text-mist/50 transition-colors hover:text-mist"
          >
            ← {t('backToCharts')}
          </Link>
        </div>
        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-8">
          {/* The sweep-failure verdict banner belongs to the closed line only;
              BacktestChart shows it on that tab, never next to the new line. */}
          <BacktestChart
            conjSrc={CONJ_BACKTEST_CHART_URL}
            sweepSrc={BACKTEST_CHART_URL}
            sweepNotice={<RecomputeNotice locale={locale} />}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
