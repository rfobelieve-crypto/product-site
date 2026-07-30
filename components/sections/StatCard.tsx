// Coinglass-style compact metric tile (2026-07-30 data-site restyle):
// flat surface, thin border, tabular numerals, tight spacing — the site's
// dark palette and fonts stay, only the data-presentation density changes.
// Used across /dashboard and every /charts/* KPI strip. Pure
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
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
      <div className="truncate font-body text-[10px] uppercase tracking-[0.14em] text-mist/45">
        {label}
      </div>
      <div className="mt-1.5 font-display text-lg font-light leading-none tracking-tight text-mist tabular-nums sm:text-xl">
        {value}
      </div>
      {delta ? (
        <div
          className={`mt-1.5 font-body text-[11px] tabular-nums ${
            delta.positive ? 'text-[#00ffa3]' : 'text-[#ff3860]'
          }`}
        >
          {delta.positive ? '↑' : '↓'} {delta.text}
        </div>
      ) : note ? (
        <div className="mt-1.5 truncate font-body text-[11px] text-mist/40">{note}</div>
      ) : null}
    </div>
  );
}

export function StatCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{children}</div>
  );
}
