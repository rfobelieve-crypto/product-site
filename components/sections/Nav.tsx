'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from './Logo';

export function Nav() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const LINKS = [
    { label: t('home'), href: '/#top' },
    { label: t('dashboard'), href: '/dashboard' },
    { label: t('system'), href: '/system' },
    { label: t('trackRecord'), href: '/track-record' },
    { label: t('signals'), href: '/signals' },
    { label: t('incidents'), href: '/incidents' },
    { label: t('charts'), href: '/charts' },
    { label: t('writeups'), href: '/writeups' },
    { label: t('liveSignal'), href: '/#live-signal' },
  ];

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      <div className="fixed inset-x-0 top-5 z-50 grid grid-cols-3 items-start px-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-start"
        >
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={t('menuLabel')}
            aria-expanded={open}
            aria-controls="site-menu"
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-ink/60 backdrop-blur-xl"
          >
            <span className={`h-px w-4 bg-mist/70 transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
            <span className={`h-px w-4 bg-mist/70 transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`h-px w-4 bg-mist/70 transition-transform ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.nav
                id="site-menu"
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
          className="flex items-center justify-end gap-2"
        >
          <div className="hidden overflow-hidden rounded-full border border-white/10 bg-ink/60 font-body text-[12px] backdrop-blur-xl sm:flex">
            <Link
              href={pathname}
              locale="en"
              className={`px-3 py-2 transition-colors ${
                locale === 'en' ? 'bg-white/10 text-mist' : 'text-mist/50 hover:text-mist'
              }`}
            >
              EN
            </Link>
            <Link
              href={pathname}
              locale="zh"
              className={`px-3 py-2 transition-colors ${
                locale === 'zh' ? 'bg-white/10 text-mist' : 'text-mist/50 hover:text-mist'
              }`}
            >
              中
            </Link>
          </div>
          <Link
            href={pathname}
            locale={locale === 'en' ? 'zh' : 'en'}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-ink/60 font-body text-[12px] text-mist/70 backdrop-blur-xl transition-colors hover:text-mist sm:hidden"
          >
            {locale === 'en' ? '中' : 'EN'}
          </Link>

          {status === 'authenticated' ? (
            <button
              onClick={() => signOut()}
              className="flex-shrink-0 whitespace-nowrap rounded-full border border-white/15 px-4 py-2.5 font-body text-[13px] text-mist/80 transition-colors hover:border-white/30 hover:text-mist"
            >
              {session.user?.email?.split('@')[0] ?? 'Account'} · {t('signOut')}
            </button>
          ) : (
            <Link
              href="/login"
              className="flex-shrink-0 whitespace-nowrap rounded-full bg-mist px-4 py-2.5 font-body text-[13px] font-medium text-void transition-opacity hover:opacity-85 sm:px-5"
            >
              {t('signIn')}
            </Link>
          )}
        </motion.div>
      </div>
    </>
  );
}
