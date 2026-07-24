import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { routing } from '@/i18n/routing';
import '../globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '500', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('siteTitle'),
    description: t('siteDescription'),
    // iOS Safari doesn't read the web manifest for "Add to Home Screen" —
    // it needs its own meta tags for standalone (no browser chrome) mode.
    // app/apple-icon.png (auto-detected by Next.js) supplies the icon;
    // this covers the launch-behavior half. Android/desktop Chrome read
    // app/manifest.ts instead, which Next.js links automatically.
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'flowbot',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#050507',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Static rendering for this locale — without this, next-intl falls
  // back to reading the locale from headers at request time, which
  // opts every page out of static generation.
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      {/* suppressHydrationWarning: browser extensions (Grammarly injects
          data-gr-ext-installed / data-new-gr-c-s-check-loaded, LastPass,
          dark-mode tools, …) mutate <body> after SSR but before React
          hydrates, producing a spurious attribute-mismatch warning that
          has nothing to do with our markup. This flag is one-level-deep —
          it only silences the mismatch on <body>'s OWN attributes, NOT its
          children — so genuine hydration bugs inside the app still surface. */}
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <SessionProvider>{children}</SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
