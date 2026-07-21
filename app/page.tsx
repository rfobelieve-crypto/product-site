import { HomeExperience } from '@/components/HomeExperience';
import { getSignalFeed } from '@/lib/signalFeed';

export default async function Home() {
  const feed = await getSignalFeed();
  return <HomeExperience feed={feed} />;
}
