'use client';

import { motion } from 'framer-motion';
import type { SignalFeed } from '@/lib/signalFeed';

const DIRECTION_LABEL: Record<string, string> = {
  UP: 'Long lean',
  DOWN: 'Short lean',
  NEUTRAL: 'Flat',
};

function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const mins = Math.round(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export function LiveSignal({ feed }: { feed: SignalFeed | null }) {
  const hasFeed = !!feed?.direction;
  const age = feed ? relativeTime(feed.signal_time) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-white/10 bg-ink/60 p-6 backdrop-blur-xl sm:p-8"
    >
      <div className="flex items-center justify-between">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
          Live signal
        </span>
        {age && (
          <span className="font-body text-xs text-mist/40">{age}</span>
        )}
      </div>

      {hasFeed ? (
        <>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-3xl font-light sm:text-4xl">
              {DIRECTION_LABEL[feed!.direction!] ?? feed!.direction}
            </span>
            {feed!.tier && (
              <span className="rounded-full border border-white/15 px-3 py-1 font-body text-xs text-mist/70">
                {feed!.tier}
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <div className="font-display text-xl font-light text-iris-cyan">
                {feed!.confidence != null ? `${feed!.confidence.toFixed(0)}` : '—'}
              </div>
              <div className="mt-1 font-body text-xs text-mist/50">confidence</div>
            </div>
            <div>
              <div className="font-display text-xl font-light">
                {feed!.regime ?? '—'}
              </div>
              <div className="mt-1 font-body text-xs text-mist/50">regime</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-display text-xl font-light">
                {feed!.entry_price != null
                  ? `$${feed!.entry_price.toLocaleString()}`
                  : '—'}
              </div>
              <div className="mt-1 font-body text-xs text-mist/50">near price</div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 font-body text-sm text-mist/50">
          Signal feed unavailable right now — the rest of the system is unaffected.
        </div>
      )}

      <p className="mt-6 border-t border-white/10 pt-4 font-body text-[11px] leading-relaxed text-mist/35">
        {feed?.disclaimer ??
          'Informational and analytical output only. Not financial advice. Past performance does not guarantee future results.'}
      </p>
    </motion.div>
  );
}
