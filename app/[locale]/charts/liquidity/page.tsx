import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { ChartDetail } from '@/components/sections/ChartDetail';
import { SweepKpiRow } from '@/components/sections/SweepKpiRow';
import { Footer } from '@/components/sections/Footer';
import { Link } from '@/i18n/navigation';
import { LIQUIDITY_CHART_URL } from '@/lib/charts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chartsPage.liquidity' });
  return { title: `${t('title')} — flowbot`, description: t('body') };
}

export default async function LiquidityChartPage({
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
          <SweepKpiRow locale={locale} />
          <p className="mt-4 font-body text-xs leading-relaxed text-mist/50">
            {t('liquidity.shadowNote')}
          </p>
        </div>
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-8">
          <ChartDetail
            src={LIQUIDITY_CHART_URL}
            label={t('liquidity.label')}
            title={t('liquidity.title')}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
