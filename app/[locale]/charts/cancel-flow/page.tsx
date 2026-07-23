import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { CancelFlowExpert } from '@/components/sections/CancelFlowExpert';
import { CancelFlowKpiGrid } from '@/components/sections/CancelFlowKpiGrid';
import { Footer } from '@/components/sections/Footer';
import { Link } from '@/i18n/navigation';
import { CANCEL_FLOW_CHART_URL } from '@/lib/charts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chartsPage.cancelFlow' });
  return { title: `${t('title')} — flowbot`, description: t('body') };
}

export default async function CancelFlowChartPage({
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
        <div className="mx-auto max-w-5xl px-6 sm:px-16">
          <Link
            href="/charts"
            className="font-body text-xs uppercase tracking-[0.25em] text-mist/50 transition-colors hover:text-mist"
          >
            ← {t('backToCharts')}
          </Link>
          <p className="mb-10 mt-3 max-w-2xl font-body text-sm text-mist/55">
            {t('cancelFlow.expertNote')}
          </p>
          <CancelFlowKpiGrid locale={locale} />
        </div>
        <div className="mt-10">
          <CancelFlowExpert src={CANCEL_FLOW_CHART_URL} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
