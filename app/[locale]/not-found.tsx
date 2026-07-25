import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/sections/Nav';

// Localized 404 — unmatched URLs land here via the [locale] segment
// (middleware assigns every non-file path a locale first).
export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
          {t('eyebrow')}
        </span>
        <h1 className="mt-4 font-display text-4xl font-light sm:text-5xl">{t('title')}</h1>
        <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-mist/60">{t('body')}</p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85"
        >
          {t('home')}
        </Link>
      </main>
    </div>
  );
}
