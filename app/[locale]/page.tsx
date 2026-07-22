import { setRequestLocale } from 'next-intl/server';
import { HomeExperience } from '@/components/HomeExperience';
import { getSignalFeed } from '@/lib/signalFeed';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const feed = await getSignalFeed();
  return <HomeExperience feed={feed} />;
}
