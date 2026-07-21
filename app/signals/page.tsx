import type { Metadata } from 'next';
import { auth, signIn, signOut } from '@/auth';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { getSignalHistory } from '@/lib/signalHistory';

export const metadata: Metadata = {
  title: 'Signal history — flowbot',
  description: 'Full tracked-signal history, signed in.',
};

const DIRECTION_COLOR: Record<string, string> = {
  UP: 'text-[#00ffa3]',
  DOWN: 'text-[#ff3860]',
};

export default async function SignalsPage() {
  // Falls back to "signed out" instead of a 500 if AUTH_SECRET / Google
  // credentials aren't configured yet in this environment — an anonymous
  // visitor should always see the sign-in prompt, never a crashed page.
  const session = await auth().catch(() => null);

  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pt-32">
        <section className="px-6 py-16 sm:px-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
            Signal history
          </span>
          <h1 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
            Every tracked signal, not just the aggregate.
          </h1>

          {!session ? (
            <div className="mt-10 max-w-md rounded-2xl border border-white/10 bg-ink/60 p-8 backdrop-blur-xl">
              <p className="font-body text-sm leading-relaxed text-mist/60">
                Sign in to see the full tracked-signal list (direction,
                tier, confidence, regime, and realized outcome) instead of
                just the aggregate win rate on the Track Record page.
              </p>
              <form
                action={async () => {
                  'use server';
                  await signIn('google', { redirectTo: '/signals' });
                }}
                className="mt-6"
              >
                <button
                  type="submit"
                  className="rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85"
                >
                  Sign in with Google
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="mt-6 flex items-center gap-3 font-body text-xs text-mist/50">
                <span>Signed in as {session.user?.email ?? session.user?.name}</span>
                <form
                  action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/signals' });
                  }}
                >
                  <button type="submit" className="text-iris-cyan/80 hover:text-iris-cyan">
                    Sign out
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
  const history = await getSignalHistory();
  if (!history || history.signals.length === 0) {
    return (
      <p className="mt-10 font-body text-sm text-mist/50">
        Signal history unavailable right now.
      </p>
    );
  }
  return (
    <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-ink/50 backdrop-blur-xl">
      <table className="w-full min-w-[560px] font-body text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-mist/50">
            <th className="px-5 py-3">Time (UTC)</th>
            <th className="px-5 py-3">Direction</th>
            <th className="px-5 py-3">Tier</th>
            <th className="px-5 py-3">Confidence</th>
            <th className="px-5 py-3">Regime</th>
            <th className="px-5 py-3">Outcome</th>
          </tr>
        </thead>
        <tbody>
          {history.signals.map((s, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              <td className="px-5 py-3 text-mist/60">{s.signal_time?.replace('T', ' ') ?? '—'}</td>
              <td className={`px-5 py-3 font-medium ${s.direction ? DIRECTION_COLOR[s.direction] ?? '' : ''}`}>
                {s.direction ?? '—'}
              </td>
              <td className="px-5 py-3 text-mist/60">{s.tier ?? '—'}</td>
              <td className="px-5 py-3 text-mist/60">
                {s.confidence != null ? s.confidence.toFixed(0) : '—'}
              </td>
              <td className="px-5 py-3 text-mist/60">{s.regime ?? '—'}</td>
              <td className="px-5 py-3 text-mist/60">
                {s.correct == null ? 'pending' : s.correct ? 'hit' : 'miss'}
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
