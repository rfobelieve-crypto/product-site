'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// Route-level error boundary — renders inside the locale layout, so fonts,
// globals.css, and translations are all available.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errorPage');
  return (
    <main className="content-layer flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-rose/80">
        {t('eyebrow')}
      </span>
      <h1 className="mt-4 font-display text-4xl font-light sm:text-5xl">{t('title')}</h1>
      <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-mist/60">{t('body')}</p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85"
        >
          {t('retry')}
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/15 px-6 py-2.5 font-body text-sm text-mist/80 transition-colors hover:border-white/30 hover:text-mist"
        >
          {t('home')}
        </Link>
      </div>
    </main>
  );
}
