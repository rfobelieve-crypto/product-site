import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { ForgotPasswordForm } from '@/components/sections/ForgotPasswordForm';
import { pageAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.forgot' });
  return {
    title: `${t('title')} — flowbot`,
    alternates: pageAlternates(locale, '/forgot-password'),
  };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth.forgot');
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer flex flex-col items-center justify-center px-6 pt-32 pb-24">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
          {t('eyebrow')}
        </span>
        <h1 className="mb-4 mt-4 font-display text-3xl font-light">{t('title')}</h1>
        <p className="mb-10 max-w-sm text-center font-body text-sm leading-relaxed text-mist/60">
          {t('body')}
        </p>
        <ForgotPasswordForm />
      </main>
      <Footer />
    </div>
  );
}
