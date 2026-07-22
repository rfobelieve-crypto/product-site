'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';

type Status = 'idle' | 'submitting' | 'error' | 'done';
type ErrorKey = 'mismatch' | 'emailTaken' | 'passwordTooShort' | 'generic' | 'network';

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tReg = useTranslations('auth.register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus('error');
      setErrorKey('mismatch');
      return;
    }
    setStatus('submitting');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus('error');
        setErrorKey(
          data.error === 'email already registered'
            ? 'emailTaken'
            : data.error === 'password must be at least 8 characters'
              ? 'passwordTooShort'
              : 'generic',
        );
        return;
      }
      // Registered — sign straight in rather than making them re-type it.
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.error) {
        setStatus('done');
        return;
      }
      router.push('/signals');
    } catch {
      setStatus('error');
      setErrorKey('network');
    }
  }

  if (status === 'done') {
    return (
      <p className="mx-auto max-w-sm text-center font-body text-sm text-iris-cyan">
        {tReg('accountCreated')}{' '}
        <Link href="/login" className="underline hover:text-mist">
          {tReg('signInLink')}
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('passwordMinPlaceholder')}
          className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none"
        />
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t('confirmPasswordPlaceholder')}
          className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="mt-2 rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {status === 'submitting' ? tReg('submitting') : tReg('submit')}
        </button>
      </form>
      {status === 'error' && errorKey && (
        <p className="mt-3 font-body text-xs text-iris-rose">{tReg(`errors.${errorKey}`)}</p>
      )}
      <p className="mt-6 text-center font-body text-xs text-mist/50">
        {tReg('haveAccount')}{' '}
        <Link href="/login" className="text-iris-cyan/80 hover:text-iris-cyan">
          {tReg('signInLink')}
        </Link>
      </p>
    </div>
  );
}
