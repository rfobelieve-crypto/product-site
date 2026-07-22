import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { Architecture } from '@/components/sections/Architecture';
import { SystemDetail } from '@/components/sections/SystemDetail';
import { Footer } from '@/components/sections/Footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'system.meta' });
  return { title: t('title'), description: t('description') };
}

// No 3D canvas here — same reasoning as /track-record: this is a reading
// page, not the cinematic hero.
export default async function SystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pt-24">
        <Architecture />
        <SystemDetail />
      </main>
      <Footer />
    </div>
  );
}
