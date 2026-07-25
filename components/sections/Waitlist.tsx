'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CONTACT_EMAIL } from '@/lib/seo';
import { EMAIL_RE } from '@/lib/rateLimit';

type Status = 'idle' | 'submitting' | 'ok' | 'error';

export function Waitlist() {
  const t = useTranslations('waitlist');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — humans never see it
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<'invalidEmail' | 'generic' | 'network' | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      setErrorKey('invalidEmail');
      return;
    }
    setStatus('submitting');
    setErrorKey(null);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), website }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus('error');
        setErrorKey(data.error === 'invalid email' ? 'invalidEmail' : 'generic');
        return;
      }
      setStatus('ok');
    } catch {
      setStatus('error');
      setErrorKey('network');
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
          {t('eyebrow')}
        </span>
        <h2 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
          {t('title')}
        </h2>
        <p className="mt-4 font-body text-sm leading-relaxed text-mist/60">{t('subtitle')}</p>

        {status === 'ok' ? (
          <p className="mt-8 font-body text-sm text-iris-cyan">{t('success')}</p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            {/* honeypot — visually hidden, ignored by humans, filled by bots */}
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none sm:w-72"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {status === 'submitting' ? t('submitting') : t('submit')}
            </button>
          </form>
        )}
        {status === 'error' && errorKey && (
          <p role="alert" className="mt-3 font-body text-xs text-iris-rose">
            {t(`errors.${errorKey}`)}
          </p>
        )}

        <p className="mt-10 font-body text-xs text-mist/50">
          {t('preferEmail')}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-iris-cyan/80 hover:text-iris-cyan">
            {CONTACT_EMAIL}
          </a>
        </p>
      </motion.div>
    </section>
  );
}
