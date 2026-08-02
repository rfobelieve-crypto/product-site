import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { ChartDetail } from '@/components/sections/ChartDetail';
import { V7KpiRow } from '@/components/sections/V7KpiRow';
import { V7FilterCard } from '@/components/sections/V7FilterCard';
import { getSweepStatus } from '@/lib/sweepStatus';
import { Footer } from '@/components/sections/Footer';
import { Link } from '@/i18n/navigation';
import { V7_CHART_URL, V7_ACCUM_I_URL } from '@/lib/charts';

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
  const sweep = await getSweepStatus();
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
          <V7KpiRow locale={locale} />
          <V7FilterCard locale={locale} sweep={sweep} />
        </div>
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-8">
          <ChartDetail src={V7_CHART_URL} label={t('v7.label')} title={t('v7.title')} />
        </div>
        <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-8">
          <ChartDetail
            src={V7_ACCUM_I_URL}
            label={t('v7.accumLabel')}
            title={t('v7.accumTitle')}
          />
          <p className="mt-2 px-1 font-body text-[11px] leading-relaxed text-mist/45">
            {t('v7.accumNote')}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
