import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { StrategyBoard } from '@/components/sections/StrategyBoard';
import { V7KpiRow } from '@/components/sections/V7KpiRow';
import { SweepKpiRow } from '@/components/sections/SweepKpiRow';
import { CancelFlowKpiGrid } from '@/components/sections/CancelFlowKpiGrid';
import { ChartDetail } from '@/components/sections/ChartDetail';
import { Link } from '@/i18n/navigation';
import { V7_CHART_URL } from '@/lib/charts';
import { pageAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboardPage.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: pageAlternates(locale, '/dashboard'),
  };
}

function SectionHeader({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-display text-xl font-light">{title}</h2>
      <Link
        href={href}
        className="whitespace-nowrap font-body text-xs uppercase tracking-[0.25em] text-iris-cyan/80 transition-colors hover:text-iris-cyan"
      >
        {cta} →
      </Link>
    </div>
  );
}

// One page, the whole system: the strategy board on top, then one dense
// section per strategy reusing the exact same server components the detail
// pages render — no second data path, so the dashboard can never disagree
// with the pages it summarizes.
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'dashboardPage' });
  const tc = await getTranslations({ locale, namespace: 'chartsPage' });

  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pb-24 pt-32">
        <section className="mx-auto max-w-6xl px-6 sm:px-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
            {t('eyebrow')}
          </span>
          <h1 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
            {t('title')}
          </h1>
          <StrategyBoard locale={locale} />
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-6 sm:px-16">
          <SectionHeader title={t('v7Section')} href="/charts/v7" cta={t('detail')} />
          <div className="mt-4">
            <V7KpiRow locale={locale} />
          </div>
        </section>
        <div className="mx-auto mt-6 max-w-6xl">
          <ChartDetail src={V7_CHART_URL} label={tc('v7.label')} title={tc('v7.title')} />
        </div>

        <section className="mx-auto mt-14 max-w-6xl px-6 sm:px-16">
          <SectionHeader title={t('sweepSection')} href="/charts/liquidity" cta={t('detail')} />
          <div className="mt-4">
            <SweepKpiRow locale={locale} />
          </div>
          <p className="mt-3 font-body text-xs leading-relaxed text-mist/50">
            {tc('liquidity.shadowNote')}
          </p>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-6 sm:px-16">
          <SectionHeader title={t('cancelSection')} href="/charts/cancel-flow" cta={t('detail')} />
          <div className="mt-4">
            <CancelFlowKpiGrid locale={locale} />
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-6 sm:px-16">
          <h2 className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet/80">
            {t('quickLinks')}
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {(
              [
                ['/track-record', t('trackRecord')],
                ['/signals', t('signalHistory')],
                ['/incidents', t('incidents')],
              ] as const
            ).map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-white/15 px-4 py-2 font-body text-xs text-mist/70 transition-colors hover:border-iris-cyan/40 hover:text-mist"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
