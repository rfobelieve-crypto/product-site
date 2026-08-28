import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { LiveCharts } from '@/components/sections/LiveCharts';
import { PreregBoardCard } from '@/components/sections/PreregBoardCard';
import { AllocationCard } from '@/components/sections/AllocationCard';
import { Footer } from '@/components/sections/Footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chartsPage.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function ChartsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pb-24 pt-24">
        <LiveCharts />
        {/* The research progress board lives here too — this is the page the
            operator actually visits; /dashboard keeps its copy. */}
        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-8">
          <PreregBoardCard locale={locale} />
        </section>
        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-8">
          <AllocationCard locale={locale} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
