import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, Noto_Sans_TC } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';
import { MotionProvider } from '@/components/MotionProvider';
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

// Real CJK coverage for zh — previously zh fell through to unpredictable
// system fonts (and Hero's canvas referenced 'Noto Sans TC' without it ever
// being loaded). unicode-range slices mean latin pages download ~nothing.
const cjk = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-cjk',
  display: 'swap',
  preload: false,
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
    metadataBase: new URL(SITE_URL),
    title: t('siteTitle'),
    description: t('siteDescription'),
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'flowbot',
    },
    // Site-wide OG/Twitter defaults. No og:title/og:url here on purpose —
    // subpages would inherit stale values; scrapers fall back to each
    // page's own <title>. app/[locale]/opengraph-image.tsx supplies the
    // card image for every page. Per-page hreflang/canonical comes from
    // pageAlternates() in each page's generateMetadata (see lib/seo.ts).
    openGraph: {
      type: 'website',
      siteName: 'flowbot',
      locale: locale === 'zh' ? 'zh_TW' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_TW'],
    },
    twitter: { card: 'summary_large_image' },
  };
}

// maximumScale removed — pinch-zoom is an accessibility requirement.
export const viewport: Viewport = {
  themeColor: '#050507',
  width: 'device-width',
  initialScale: 1,
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
  setRequestLocale(locale);

  return (
    // Content is Traditional Chinese — zh-Hant, not bare zh.
    <html
      lang={locale === 'zh' ? 'zh-Hant' : locale}
      className={`${display.variable} ${body.variable} ${cjk.variable}`}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <SessionProvider>
            {/* framer-motion respects the OS reduced-motion setting */}
            <MotionProvider>{children}</MotionProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
