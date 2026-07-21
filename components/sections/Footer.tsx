export function Footer() {
  return (
    <footer className="relative flex flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="font-display text-2xl font-light sm:text-3xl">
        Built in the open. Still being proven.
      </p>
      <div className="flex gap-6 font-body text-xs uppercase tracking-[0.2em] text-mist/50">
        <a href="#" className="transition hover:text-iris-cyan">
          Write-ups
        </a>
        <a href="#" className="transition hover:text-iris-cyan">
          GitHub
        </a>
        <a href="#" className="transition hover:text-iris-cyan">
          Contact
        </a>
      </div>
      <p className="mt-8 text-[11px] text-mist/30">
        Not investment advice. Nothing here is a solicitation to trade.
      </p>
    </footer>
  );
}
