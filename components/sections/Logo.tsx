// Placeholder mark — swap the <svg> below whenever the real logo is
// ready. Kept as its own component so that's a one-file change, not a
// hunt through Nav.tsx. The shape is a small nod to the site's own K-line
// motif (two candle bars) rather than a generic circle-and-wordmark.
export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <rect x="0.5" y="0.5" width="21" height="21" rx="6" className="fill-ink stroke-white/10" />
        <rect x="6" y="5" width="3" height="8" rx="1" fill="#00ffa3" />
        <rect x="6.9" y="3" width="1.2" height="12" fill="#00ffa3" />
        <rect x="13" y="9" width="3" height="8" rx="1" fill="#ff3860" />
        <rect x="13.9" y="7" width="1.2" height="12" fill="#ff3860" />
      </svg>
      <span className="font-display text-sm tracking-tight">flowbot</span>
    </div>
  );
}
