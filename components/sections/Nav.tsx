'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Logo } from './Logo';

// Root-relative so these work identically from the home page (scrolls)
// and from other routes (navigates home, then scrolls) — plain "#anchor"
// only resolves on the page it's declared on.
const LINKS = [
  { label: 'Home', href: '/#top' },
  { label: 'System', href: '/system' },
  { label: 'Track record', href: '/track-record' },
  { label: 'Signals', href: '/signals' },
  { label: 'Incidents', href: '/incidents' },
  { label: 'Live signal', href: '/#live-signal' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <>
      {/* click-away backdrop, only present while the menu is open */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      {/* A single full-width 3-column grid, not three independently
          `left-1/2`-centered elements — percentage-based centering on a
          `position: fixed` element reads off the LAYOUT viewport on
          mobile Safari, which can be wider than what's actually visible
          whenever anything on the page overflows horizontally, so the
          logo drifted right instead of sitting in the true center. Equal
          side columns in a grid center the middle column reliably
          regardless of that quirk. */}
      <div className="fixed inset-x-0 top-5 z-50 grid grid-cols-3 items-start px-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-start"
        >
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-ink/60 backdrop-blur-xl"
          >
            <span className={`h-px w-4 bg-mist/70 transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
            <span className={`h-px w-4 bg-mist/70 transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`h-px w-4 bg-mist/70 transition-transform ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-ink/90 py-2 backdrop-blur-xl"
              >
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 font-body text-sm text-mist/70 transition-colors hover:bg-white/5 hover:text-mist"
                  >
                    {l.label}
                  </Link>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>

        {/* centered logo — placeholder mark, swap Logo.tsx once the real
            one is ready */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          <Link
            href="/#top"
            className="flex items-center rounded-full border border-white/10 bg-ink/60 px-5 py-2.5 backdrop-blur-xl"
          >
            <Logo />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-end"
        >
          {status === 'authenticated' ? (
            <button
              onClick={() => signOut()}
              className="rounded-full border border-white/15 px-4 py-2.5 font-body text-[13px] text-mist/80 transition-colors hover:border-white/30 hover:text-mist"
            >
              {session.user?.email?.split('@')[0] ?? 'Account'} · Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-mist px-5 py-2.5 font-body text-[13px] font-medium text-void transition-opacity hover:opacity-85"
            >
              Sign in
            </Link>
          )}
        </motion.div>
      </div>
    </>
  );
}
