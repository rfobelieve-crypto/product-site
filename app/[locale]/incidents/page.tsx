import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { EngineeringLog } from '@/components/sections/EngineeringLog';
import { Footer } from '@/components/sections/Footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'incidentsPage.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function IncidentsPage({
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
        <EngineeringLog />
      </main>
      <Footer />
    </div>
  );
}
