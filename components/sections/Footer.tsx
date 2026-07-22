'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="relative flex flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="font-display text-2xl font-light sm:text-3xl">{t('tagline')}</p>
      <div className="flex gap-6 font-body text-xs uppercase tracking-[0.2em] text-mist/50">
        <a href="#" className="transition hover:text-iris-cyan">
          {t('writeUps')}
        </a>
        <a href="#" className="transition hover:text-iris-cyan">
          {t('github')}
        </a>
        <Link href="/#contact" className="transition hover:text-iris-cyan">
          {t('contact')}
        </Link>
      </div>
      <p className="mt-8 text-[11px] text-mist/50">{t('disclaimer')}</p>
    </footer>
  );
}
