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
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-ink/70">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/[0.06] px-4 py-2.5 sm:px-5">
        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-iris-violet/80">
          {label}
        </span>
        <h1 className="font-display text-base font-light">{title}</h1>
      </div>
      <div className="p-2 sm:p-3">
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
          className="h-[75vh] max-h-[900px] min-h-[500px] w-full rounded-xl border-0"
        />
      </div>
    </div>
  );
}
