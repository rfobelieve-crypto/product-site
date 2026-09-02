import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSignalFeed } from '@/lib/signalFeed';
import { getSweepStatus, SWEEP_B_VERDICT, SWEEP_SETTLED } from '@/lib/sweepStatus';

const DIRECTION_LABEL: Record<string, string> = {
  UP: '↑ UP',
  DOWN: '↓ DOWN',
  NEUTRAL: '· NEUTRAL',
};

const MODE_STYLE: Record<string, string> = {
  live: 'border-[#00ffa3]/40 text-[#00ffa3]',
  shadow: 'border-iris-cyan/40 text-iris-cyan',
  research: 'border-white/25 text-mist/60',
};

function Card({
  mode,
  modeLabel,
  name,
  desc,
  stat,
  href,
  cta,
}: {
  mode: 'live' | 'shadow' | 'research';
  modeLabel: string;
  name: string;
  desc: string;
  stat: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-white/[0.08] bg-ink/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-lg font-light">{name}</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 font-body text-[10px] uppercase tracking-[0.2em] ${MODE_STYLE[mode]}`}
        >
          {modeLabel}
        </span>
      </div>
      <p className="mt-1.5 font-body text-[11px] leading-relaxed text-mist/50">{desc}</p>
      <div className="mt-3 font-body text-sm text-mist/85 tabular-nums">{stat}</div>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-iris-cyan/80 transition-colors hover:text-iris-cyan"
      >
        {cta}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

// Server component: three strategy cards (live / shadow / research), each
// fed by its own null-safe fetch so one feed outage degrades one card.
export async function StrategyBoard({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'signals.board' });
  const [feed, sweep] = await Promise.all([getSignalFeed(), getSweepStatus()]);

  const v7Stat = feed?.direction
    ? `${DIRECTION_LABEL[feed.direction] ?? feed.direction}${feed.tier ? ` · ${feed.tier}` : ''}${
        feed.confidence != null ? ` · ${feed.confidence.toFixed(0)}` : ''
      }`
    : t('unavailable');
  // Same rule as SweepKpiRow: B is settled, so the frozen verdict numbers win
  // over the endpoint's in-image recount.
  const g = SWEEP_SETTLED.B === 'FAIL' ? SWEEP_B_VERDICT : sweep?.gate;
  const sweepStat = g
    ? t('sweepGate', {
        n: g.n_closed,
        floor: g.floor,
        mean: g.mean_r != null ? `${g.mean_r >= 0 ? '+' : ''}${g.mean_r.toFixed(2)}` : '—',
        wr: g.wr_pct != null ? g.wr_pct.toFixed(0) : '—',
      })
    : t('unavailable');

  return (
    <section className="mt-10">
      <h2 className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet/80">
        {t('title')}
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          mode="live"
          modeLabel={t('live')}
          name={t('v7Name')}
          desc={t('v7Desc')}
          stat={v7Stat}
          href="/charts/v7"
          cta={t('viewChart')}
        />
        <Card
          mode="shadow"
          modeLabel={t('shadow')}
          name={t('sweepName')}
          desc={t('sweepDesc')}
          stat={sweepStat}
          href="/charts/liquidity"
          cta={t('viewChart')}
        />
        <Card
          mode="research"
          modeLabel={t('research')}
          name={t('cancelName')}
          desc={t('cancelDesc')}
          stat="—"
          href="/charts/cancel-flow"
          cta={t('viewChart')}
        />
      </div>
    </section>
  );
}
