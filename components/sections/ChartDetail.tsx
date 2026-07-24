'use client';

export function ChartDetail({
  src,
  label,
  title,
}: {
  src: string;
  label: string;
  title: string;
}) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-ink/60 backdrop-blur-xl">
      <div className="p-6 pb-0 sm:p-8 sm:pb-0">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-violet/80">
          {label}
        </span>
        <h1 className="mt-2 font-display text-xl font-light">{title}</h1>
      </div>
      <div className="p-4 sm:p-6">
        {/* Already-rendered interactive HTML (TradingView Lightweight
            Charts — zoom/pan/crosshair built in) relayed from Railway; see
            lib/charts.ts. The page renders its own dark background/loading
            state and its own "not ready" fallback, so unlike the old
            static-PNG version there's no separate failed-state to track
            here — a bad fetch on the origin still returns readable HTML.
            No loading="lazy": the embedded page sizes its panels from
            window.innerHeight once at first paint, and a lazily-activated
            iframe reads that before its CSS box has a real height,
            collapsing every pane to 0px (confirmed via local testing,
            2026-07-24). */}
        <iframe
          src={src}
          title={title}
          className="h-[520px] w-full rounded-xl border-0 sm:h-[640px]"
        />
      </div>
    </div>
  );
}
