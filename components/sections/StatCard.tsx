// Dense KPI stat card — same glass-panel language as ChartDetail /
// CancelFlowExpert (border-white/10, bg-ink/60, backdrop-blur-xl) so the
// new dashboard-style rows on /charts/v7 and /charts/cancel-flow read as
// part of the same site, not a bolted-on different aesthetic. Pure
// presentational, server-renderable — no client state.
export function StatCard({
  label,
  value,
  delta,
  note,
}: {
  label: string;
  value: string;
  /** Small colored indicator under the value, e.g. "+3.1%" / "-0.4%". */
  delta?: { text: string; positive: boolean } | null;
  /** Muted one-liner under the value when there's no delta to show (e.g.
   * an "accumulating" state for a coin with too little history yet). */
  note?: string | null;
}) {
  return (
    <div className="glass-panel rounded-2xl border border-white/10 bg-ink/60 p-5 backdrop-blur-xl">
      <div className="font-body text-xs uppercase tracking-[0.2em] text-mist/50">{label}</div>
      <div className="mt-2 font-display text-2xl font-light leading-none text-mist sm:text-3xl">
        {value}
      </div>
      {delta ? (
        <div
          className={`mt-2 font-body text-xs ${
            delta.positive ? 'text-[#00ffa3]' : 'text-[#ff3860]'
          }`}
        >
          {delta.positive ? '↑' : '↓'} {delta.text}
        </div>
      ) : note ? (
        <div className="mt-2 font-body text-xs text-mist/40">{note}</div>
      ) : null}
    </div>
  );
}

export function StatCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
  );
}
