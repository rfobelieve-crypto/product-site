import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { BacktestChart } from '@/components/sections/BacktestChart';
import { Footer } from '@/components/sections/Footer';
import { Link } from '@/i18n/navigation';
import { BACKTEST_CHART_URL } from '@/lib/charts';

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
  const b = await getTranslations({ locale, namespace: 'chartsPage.backtest' });
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
          <p className="font-body text-xs leading-relaxed text-mist/50">
            {b('note')}
          </p>
          <details className="mt-3 rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
            <summary className="cursor-pointer font-body text-xs text-iris-cyan/80">
              {b('guideTitle')}
            </summary>
            <div className="mt-3 space-y-2 font-body text-[11px] leading-relaxed text-mist/55">
              <p>{b('guideMarks')}</p>
              <p>{b('guideTable')}</p>
              <p>{b('guideKpi')}</p>
              <p>{b('guideAudit')}</p>
            </div>
          </details>
        </div>
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-8">
          <BacktestChart src={BACKTEST_CHART_URL} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
