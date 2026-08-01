// Framed PNG panel — same chrome as ChartDetail so a static chart sits
// beside the interactive ones without looking like a different site, but
// an <img> instead of an <iframe>. Collapsed by default via <details>:
// the V7 page already carries the KPI row, the filter card and the
// interactive chart, and a fourth full-width block open by default is
// what "版面太亂" looks like. One click opens it; a second link opens the
// raw PNG full size for reading the small panels on a phone.
export function ImagePanel({
  src,
  label,
  title,
  note,
  openLabel,
}: {
  src: string;
  label: string;
  title: string;
  note?: string;
  openLabel: string;
}) {
  return (
    <details className="group overflow-hidden rounded-xl border border-white/[0.08] bg-ink/70">
      <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/[0.06] px-4 py-2.5 marker:content-[''] sm:px-5">
        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-iris-violet/80">
          {label}
        </span>
        <h2 className="font-display text-base font-light">{title}</h2>
        <span className="ml-auto font-body text-[11px] text-mist/45 transition-colors group-hover:text-mist/70">
          <span className="group-open:hidden">＋ {openLabel}</span>
          <span className="hidden group-open:inline">−</span>
        </span>
      </summary>
      <div className="p-2 sm:p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          loading="lazy"
          className="w-full rounded-lg"
        />
        {note && (
          <p className="mt-2 px-1 font-body text-[11px] leading-relaxed text-mist/45">
            {note}
          </p>
        )}
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block px-1 font-body text-[11px] text-iris-cyan/70 underline-offset-2 hover:underline"
        >
          ↗
        </a>
      </div>
    </details>
  );
}
