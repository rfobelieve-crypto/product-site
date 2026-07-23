import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { ChartDetail } from '@/components/sections/ChartDetail';
import { V7KpiRow } from '@/components/sections/V7KpiRow';
import { Footer } from '@/components/sections/Footer';
import { Link } from '@/i18n/navigation';
import { V7_CHART_URL } from '@/lib/charts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chartsPage.v7' });
  return { title: `${t('title')} — flowbot`, description: t('body') };
}

export default async function V7ChartPage({
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
        </div>
        <div className="mx-auto mt-8 max-w-5xl px-6 sm:px-16">
          <V7KpiRow locale={locale} />
        </div>
        <div className="mt-6">
          <ChartDetail src={V7_CHART_URL} label={t('v7.label')} title={t('v7.title')} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
