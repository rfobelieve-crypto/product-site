import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { StrategyBoard } from '@/components/sections/StrategyBoard';
import { V7KpiRow } from '@/components/sections/V7KpiRow';
import { SweepKpiRow } from '@/components/sections/SweepKpiRow';
import { CancelFlowKpiGrid } from '@/components/sections/CancelFlowKpiGrid';
import { LiveTradesPanel } from '@/components/sections/LiveTradesPanel';
import { ShadowTradesPanel } from '@/components/sections/ShadowTradesPanel';
import { ShadowLedgerBoard } from '@/components/sections/ShadowLedgerBoard';
import { V7FilterCard } from '@/components/sections/V7FilterCard';
import { StatCard, StatCardGrid } from '@/components/sections/StatCard';
import { Link } from '@/i18n/navigation';
import { getLiveStatus } from '@/lib/liveStatus';
import { getSweepStatus } from '@/lib/sweepStatus';
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
    <div className="flex items-baseline justify-between gap-4 border-l-2 border-iris-cyan/70 pl-3">
      <h2 className="font-display text-base font-light">{title}</h2>
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
  const [live, sweep] = await Promise.all([getLiveStatus(), getSweepStatus()]);
  const dash = '—';

  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pb-24 pt-32">
        <section className="mx-auto max-w-7xl px-4 sm:px-8">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
            {t('eyebrow')}
          </span>
          <h1 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
            {t('title')}
          </h1>

          {/* portfolio overview strip — the "totals row" of a trading
              console: live compounded return, live WR, forward-shadow
              progress, next pre-registered verdict */}
          <div className="mt-6">
            <StatCardGrid>
              <StatCard
                label={t('overview.cum')}
                value={
                  live?.totals.cum_net_pct != null
                    ? `${live.totals.cum_net_pct >= 0 ? '+' : ''}${live.totals.cum_net_pct.toFixed(1)}%`
                    : dash
                }
                note={live ? t('overview.trades', { n: live.totals.n_closed }) : null}
              />
              <StatCard
                label={t('overview.wr')}
                value={
                  live?.totals.win_rate_pct != null
                    ? `${live.totals.win_rate_pct.toFixed(0)}%`
                    : dash
                }
              />
              <StatCard
                label={t('overview.sweepProgress')}
                value={sweep?.gate ? `${sweep.gate.n_closed}/${sweep.gate.floor}` : dash}
                note={
                  sweep?.gate?.mean_r != null
                    ? `netR ${sweep.gate.mean_r >= 0 ? '+' : ''}${sweep.gate.mean_r.toFixed(2)}`
                    : null
                }
              />
              <StatCard label={t('overview.nextVerdict')} value={t('overview.nextVerdictVal')} />
            </StatCardGrid>
          </div>

          <StrategyBoard locale={locale} />
        </section>

        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-8">
          <SectionHeader title={t('v7Section')} href="/charts/v7" cta={t('detail')} />
          <div className="mt-3">
            <V7KpiRow locale={locale} />
          </div>
          <div className="mt-3">
            <LiveTradesPanel locale={locale} live={live} />
          </div>
          <V7FilterCard locale={locale} sweep={sweep} />
        </section>
        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-8">
          <SectionHeader title={t('sweepSection')} href="/charts/liquidity" cta={t('detail')} />
          <div className="mt-3">
            <SweepKpiRow locale={locale} />
          </div>
          <div className="mt-3">
            <ShadowTradesPanel locale={locale} sweep={sweep} />
          </div>
          <ShadowLedgerBoard locale={locale} sweep={sweep} />
          <p className="mt-3 font-body text-xs leading-relaxed text-mist/50">
            {tc('liquidity.shadowNote')}
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-8">
          <SectionHeader title={t('cancelSection')} href="/charts/cancel-flow" cta={t('detail')} />
          <div className="mt-3">
            <CancelFlowKpiGrid locale={locale} />
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-8">
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
