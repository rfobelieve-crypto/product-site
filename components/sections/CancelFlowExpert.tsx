'use client';

// 2026-07-24: was a 3-card CSS-crop of one static PNG (see git history —
// research/plot_cancel_flow.py rendered one tall image, this component cut
// windowed slices out of it with negative background-position math). The
// interactive twin (research/cancel_flow_interactive.py, served via
// /research/cancel-flow-i) already renders the same three panes — price,
// cancellation asymmetry, cancellation intensity — as properly synced
// Lightweight-Charts panels (shared zoom/pan/crosshair), so the crop hack
// is gone entirely: one iframe replaces three cropped cards.
export function CancelFlowExpert({ src, title }: { src: string; title: string }) {
  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-16">
      <div className="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-ink/60 backdrop-blur-xl">
        {/* No loading="lazy" — the embedded page computes its panel
            heights from window.innerHeight once, synchronously, at first
            paint; a lazily-activated iframe reads that before its box has
            a real size, collapsing every pane to 0px (confirmed via
            local testing, 2026-07-24). */}
        <iframe
          src={src}
          title={title}
          className="h-[85vh] max-h-[1050px] min-h-[650px] w-full rounded-xl border-0"
        />
      </div>
    </div>
  );
}
