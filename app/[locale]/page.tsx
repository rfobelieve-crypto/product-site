import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { HomeExperience } from '@/components/HomeExperience';
import { IntroGate } from '@/components/intro/IntroGate';
import { getSignalFeed } from '@/lib/signalFeed';
import { pageAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates(locale, '/') };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const feed = await getSignalFeed();
  return (
    <IntroGate>
      <HomeExperience feed={feed} />
    </IntroGate>
  );
}
