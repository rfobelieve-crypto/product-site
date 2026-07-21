'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// Root-relative so these work identically from the home page (scrolls)
// and from other routes (navigates home, then scrolls) — plain "#anchor"
// only resolves on the page it's declared on.
const LINKS = [
  { label: 'System', href: '/system' },
  { label: 'Signals', href: '/signals' },
  { label: 'Incidents', href: '/incidents' },
];

export function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-5 z-50 flex justify-center px-4"
    >
      <nav className="flex w-full max-w-3xl items-center justify-between rounded-full border border-white/10 bg-ink/60 px-5 py-2.5 backdrop-blur-xl">
        <Link href="/#top" className="flex items-center gap-2 font-display text-sm tracking-tight">
          <span className="h-2 w-2 rounded-full bg-iris-cyan shadow-[0_0_8px_2px_rgba(126,249,255,0.6)]" />
          flowbot
        </Link>

        <ul className="hidden items-center gap-7 font-body text-[13px] text-mist/60 sm:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors hover:text-mist">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/track-record"
            className="rounded-full border border-white/15 px-4 py-1.5 font-body text-[13px] text-mist/80 transition-colors hover:border-white/30 hover:text-mist"
          >
            Track record
          </Link>
          <Link
            href="/#live-signal"
            className="rounded-full bg-mist px-4 py-1.5 font-body text-[13px] font-medium text-void transition-opacity hover:opacity-85"
          >
            Live signal
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
