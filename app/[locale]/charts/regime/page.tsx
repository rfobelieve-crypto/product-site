import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { ChartDetail } from '@/components/sections/ChartDetail';
import { Footer } from '@/components/sections/Footer';
import { Link } from '@/i18n/navigation';
import { REGIME_CHART_URL, REGIME_ACCURACY_URL } from '@/lib/charts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chartsPage.regime' });
  return { title: `${t('title')} — flowbot`, description: t('body') };
}

// Live regime board: rebuilt hourly by arb/ops/regime_site.py (Binance 1h
// candles -> per-coin 168h MA band states -> public/archive/regime/).
export default async function RegimeChartPage({
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
          <ChartDetail src={REGIME_CHART_URL} label={t('regime.label')} title={t('regime.title')} />
          <p className="mt-2 px-1 font-body text-[11px] leading-relaxed text-mist/45">
            {t('regime.body')}
          </p>
        </div>
        <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-8">
          <ChartDetail src={REGIME_ACCURACY_URL} label={t('regime.label')} title={t('regime.accuracyTitle')} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
