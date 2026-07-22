import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { LiveCharts } from '@/components/sections/LiveCharts';
import { Footer } from '@/components/sections/Footer';
import { V7_CHART_URL, CANCEL_FLOW_CHART_URL } from '@/lib/charts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chartsPage.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function ChartsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pb-24 pt-24">
        <LiveCharts v7ChartUrl={V7_CHART_URL} cancelFlowChartUrl={CANCEL_FLOW_CHART_URL} />
      </main>
      <Footer />
    </div>
  );
}
