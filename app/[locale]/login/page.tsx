import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { LoginForm } from '@/components/sections/LoginForm';
import { Footer } from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'Sign in — flowbot',
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth.loginPage');
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer flex flex-col items-center justify-center px-6 pt-32 pb-24">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
          {t('eyebrow')}
        </span>
        <h1 className="mb-10 mt-4 font-display text-3xl font-light">{t('title')}</h1>
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
