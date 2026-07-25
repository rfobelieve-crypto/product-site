'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONTACT_EMAIL } from '@/lib/seo';

// External links render only when configured — no more href="#" dead ends
// on a site whose whole pitch is transparency.
const WRITEUPS_URL = process.env.NEXT_PUBLIC_WRITEUPS_URL;
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL;

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="relative flex flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="font-display text-2xl font-light sm:text-3xl">{t('tagline')}</p>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-body text-xs uppercase tracking-[0.2em] text-mist/50">
        {WRITEUPS_URL && (
          <a href={WRITEUPS_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-iris-cyan">
            {t('writeUps')}
          </a>
        )}
        {GITHUB_URL && (
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-iris-cyan">
            {t('github')}
          </a>
        )}
        <a href={`mailto:${CONTACT_EMAIL}`} className="transition hover:text-iris-cyan">
          {t('contact')}
        </a>
        <Link href="/privacy" className="transition hover:text-iris-cyan">
          {t('privacy')}
        </Link>
        <Link href="/terms" className="transition hover:text-iris-cyan">
          {t('terms')}
        </Link>
      </div>
      <p className="mt-8 text-[11px] text-mist/50">{t('disclaimer')}</p>
    </footer>
  );
}
