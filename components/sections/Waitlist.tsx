'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// TODO: replace before shipping — this is a placeholder so the button
// doesn't silently point nowhere. Not a real inbox yet.
const CONTACT_EMAIL = 'hello@flowbot.example';

type Status = 'idle' | 'submitting' | 'ok' | 'error';

export function Waitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus('error');
        setErrorMsg(data.error === 'invalid email' ? 'That doesn’t look like a valid email.' : 'Something went wrong — try again shortly.');
        return;
      }
      setStatus('ok');
    } catch {
      setStatus('error');
      setErrorMsg('Network error — try again shortly.');
    }
  }

  return (
    <section id="contact" className="relative px-6 py-32 sm:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-lg text-center"
      >
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
          Stay in the loop
        </span>
        <h2 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
          Get notified on write-ups and methodology updates.
        </h2>
        <p className="mt-4 font-body text-sm leading-relaxed text-mist/60">
          Not a signal-access list — no trading calls go out here. Just the
          engineering log and track-record updates as they happen.
        </p>

        {status === 'ok' ? (
          <p className="mt-8 font-body text-sm text-iris-cyan">
            You&rsquo;re on the list. Thanks for following along.
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none sm:w-72"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Sending…' : 'Notify me'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="mt-3 font-body text-xs text-iris-rose">{errorMsg}</p>
        )}

        <p className="mt-10 font-body text-xs text-mist/50">
          Prefer email?{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-iris-cyan/80 hover:text-iris-cyan">
            {CONTACT_EMAIL}
          </a>
        </p>
      </motion.div>
    </section>
  );
}
