import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { auth, signOut } from '@/auth';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { getSignalHistory } from '@/lib/signalHistory';
import { pageAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'signals.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: pageAlternates(locale, '/signals'),
  };
}

const DIRECTION_COLOR: Record<string, string> = {
  UP: 'text-[#00ffa3]',
  DOWN: 'text-[#ff3860]',
};

function localized(raw: string | null | undefined, map: Record<string, string>): string | null {
  if (!raw) return null;
  return map[raw.toUpperCase().replace(/[\s-]+/g, '_')] ?? raw;
}

export default async function SignalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('signals');
  const session = await auth().catch(() => null);

  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pt-32">
        <section className="px-6 py-16 sm:px-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
            {t('eyebrow')}
          </span>
          <h1 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
            {t('title')}
          </h1>

          {!session ? (
            <div className="glass-panel mt-10 max-w-md rounded-2xl border border-white/10 bg-ink/60 p-8 backdrop-blur-xl">
              <p className="font-body text-sm leading-relaxed text-mist/60">{t('gatedBody')}</p>
              <Link
                href="/login"
                className="mt-6 inline-block rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85"
              >
                {t('signIn')}
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-6 flex items-center gap-3 font-body text-xs text-mist/50">
                <span>
                  {t('signedInAs', { email: session.user?.email ?? session.user?.name ?? '' })}
                </span>
                <form
                  action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/signals' });
                  }}
                >
                  <button type="submit" className="text-iris-cyan/80 hover:text-iris-cyan">
                    {t('signOut')}
                  </button>
                </form>
              </div>
              <SignalTable />
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

async function SignalTable() {
  const t = await getTranslations('signals');
  // Direction / tier / regime render localized (raw feed values are
  // English enums) — unknown values fall back to the raw string.
  const tLive = await getTranslations('liveSignal');
  const regimes = tLive.raw('regimes') as Record<string, string>;
  const tiers = tLive.raw('tiers') as Record<string, string>;
  const directions = tLive.raw('direction') as Record<string, string>;
  const history = await getSignalHistory();
  if (!history || history.signals.length === 0) {
    return <p className="mt-10 font-body text-sm text-mist/50">{t('unavailable')}</p>;
  }
  return (
    <div className="glass-panel mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-ink/50 backdrop-blur-xl">
      <table className="w-full min-w-[560px] font-body text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-mist/50">
            <th className="px-5 py-3">{t('table.time')}</th>
            <th className="px-5 py-3">{t('table.direction')}</th>
            <th className="px-5 py-3">{t('table.tier')}</th>
            <th className="px-5 py-3">{t('table.confidence')}</th>
            <th className="px-5 py-3">{t('table.regime')}</th>
            <th className="px-5 py-3">{t('table.outcome')}</th>
          </tr>
        </thead>
        <tbody>
          {history.signals.map((s, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              <td className="px-5 py-3 text-mist/60">{s.signal_time?.replace('T', ' ') ?? '—'}</td>
              <td className={`px-5 py-3 font-medium ${s.direction ? DIRECTION_COLOR[s.direction] ?? '' : ''}`}>
                {localized(s.direction, directions) ?? '—'}
              </td>
              <td className="px-5 py-3 text-mist/60">{localized(s.tier, tiers) ?? '—'}</td>
              <td className="px-5 py-3 text-mist/60">
                {s.confidence != null ? s.confidence.toFixed(0) : '—'}
              </td>
              <td className="px-5 py-3 text-mist/60">{localized(s.regime, regimes) ?? '—'}</td>
              <td className="px-5 py-3 text-mist/60">
                {s.correct == null ? t('table.pending') : s.correct ? t('table.hit') : t('table.miss')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-white/10 p-5 font-body text-xs leading-relaxed text-mist/50">
        {history.disclaimer}
      </p>
    </div>
  );
}
