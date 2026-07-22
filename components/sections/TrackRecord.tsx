'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { TrackRecord as TrackRecordData } from '@/lib/trackRecord';

function CIBar({ ci95, point }: { ci95: [number, number] | null; point: number | null }) {
  const t = useTranslations('trackRecord');
  if (!ci95 || point == null) return null;
  const [lo, hi] = ci95;
  return (
    <div className="mt-3">
      <div className="relative h-1.5 rounded-full bg-white/10">
        <div
          className="absolute h-full rounded-full bg-iris-cyan/40"
          style={{ left: `${lo}%`, width: `${Math.max(hi - lo, 1)}%` }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-iris-cyan"
          style={{ left: `${point}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-body text-[10px] text-mist/55">
        <span>{lo.toFixed(0)}%</span>
        <span>{t('confidenceInterval')}</span>
        <span>{hi.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function Metric({
  label,
  n,
  nLabel,
  winRate,
  ci95,
  note,
}: {
  label: string;
  n: number;
  nLabel: string;
  winRate: number | null;
  ci95: [number, number] | null;
  note: string;
}) {
  const t = useTranslations('trackRecord');
  return (
    <div className="glass-panel rounded-2xl border border-white/10 bg-ink/60 p-6 backdrop-blur-xl sm:p-8">
      <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet/80">
        {label}
      </span>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-4xl font-light">
          {winRate != null ? `${winRate.toFixed(1)}%` : '—'}
        </span>
        <span className="font-body text-xs text-mist/55">{t('winRate')}</span>
      </div>
      <CIBar ci95={ci95} point={winRate} />
      <div className="mt-4 font-body text-xs text-mist/50">
        {t('sampleSize', { count: n.toLocaleString(), label: nLabel })}
      </div>
      {/* note comes straight from the backend stats API, English-only —
          not a static UI string, so it isn't run through next-intl. */}
      <p className="mt-2 font-body text-xs leading-relaxed text-mist/50">{note}</p>
    </div>
  );
}

export function TrackRecord({ data }: { data: TrackRecordData | null }) {
  const t = useTranslations('trackRecord');
  return (
    <section className="relative px-6 py-32 sm:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
          {t('eyebrow')}
        </span>
        <h2 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
          {t('title')}
        </h2>
        <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-mist/60 sm:text-base">
          {t('subtitle')}
        </p>
      </motion.div>

      {data ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-6 sm:grid-cols-2"
        >
          <Metric
            label={t('signalLayer')}
            n={data.signal_layer.n}
            nLabel={t('strongTierLabel')}
            winRate={data.signal_layer.win_rate_pct}
            ci95={data.signal_layer.ci95}
            note={data.signal_layer.note}
          />
          <Metric
            label={t('tradeLayer')}
            n={data.trade_layer.n_closed}
            nLabel={t('closedTradesLabel')}
            winRate={data.trade_layer.win_rate_pct}
            ci95={data.trade_layer.ci95}
            note={data.trade_layer.note}
          />
        </motion.div>
      ) : (
        <div className="font-body text-sm text-mist/50">{t('unavailable')}</div>
      )}

      {data?.mdd_pct != null && (
        <div className="mt-6 font-body text-xs text-mist/55">
          {t('maxDrawdown', { value: data.mdd_pct.toFixed(1) })}
        </div>
      )}

      {/* caveat/disclaimer come straight from the backend stats API when
          present, English-only — not static UI strings. Only the
          fallback (no data at all) is a real UI string worth
          translating. */}
      <p className="mt-6 max-w-xl font-body text-xs leading-relaxed text-mist/50">
        {data?.caveat ?? t('defaultCaveat')}{' '}
        {data?.disclaimer}
      </p>
    </section>
  );
}
