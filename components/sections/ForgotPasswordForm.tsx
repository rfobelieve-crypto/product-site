'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONTACT_EMAIL } from '@/lib/seo';

type Status = 'idle' | 'submitting' | 'sent' | 'notConfigured' | 'error';

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgot');
  const tErr = useTranslations('waitlist.errors');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 503) {
        setStatus('notConfigured');
        return;
      }
      const data = await res.json().catch(() => ({ ok: false }));
      setStatus(res.ok && data.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <p className="max-w-sm text-center font-body text-sm text-iris-cyan">{t('sent')}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="mt-2 rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {status === 'submitting' ? t('submitting') : t('submit')}
        </button>
      </form>
      {status === 'notConfigured' && (
        <p role="alert" className="mt-3 text-center font-body text-xs text-mist/60">
          {t('notConfigured')}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-iris-cyan/80 hover:text-iris-cyan">
            {CONTACT_EMAIL}
          </a>
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="mt-3 text-center font-body text-xs text-iris-rose">
          {tErr('generic')}
        </p>
      )}
      <p className="mt-6 text-center font-body text-xs text-mist/50">
        <Link href="/login" className="text-iris-cyan/80 hover:text-iris-cyan">
          {t('back')}
        </Link>
      </p>
    </div>
  );
}
