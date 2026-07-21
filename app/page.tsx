import { HomeExperience } from '@/components/HomeExperience';
import { getSignalFeed } from '@/lib/signalFeed';
import { getTrackRecord } from '@/lib/trackRecord';

export default async function Home() {
  const [feed, trackRecord] = await Promise.all([
    getSignalFeed(),
    getTrackRecord(),
  ]);
  return <HomeExperience feed={feed} trackRecord={trackRecord} />;
}
