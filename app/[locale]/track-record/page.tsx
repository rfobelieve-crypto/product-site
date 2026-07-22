import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { TrackRecord } from '@/components/sections/TrackRecord';
import { Footer } from '@/components/sections/Footer';
import { getTrackRecord } from '@/lib/trackRecord';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trackRecordPage.meta' });
  return { title: t('title'), description: t('description') };
}

// No 3D canvas on this route — it's a data page, not the cinematic hero;
// carrying the WebGL bundle here would be pure cost with no payoff.
export default async function TrackRecordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = await getTrackRecord();
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pt-32">
        <TrackRecord data={data} />
      </main>
      <Footer />
    </div>
  );
}
