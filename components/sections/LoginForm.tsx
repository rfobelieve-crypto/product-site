'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tLogin = useTranslations('auth.login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setStatus('error');
      return;
    }
    router.push('/signals');
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('passwordPlaceholder')}
          className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="mt-2 rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {status === 'submitting' ? tLogin('submitting') : tLogin('submit')}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-3 font-body text-xs text-iris-rose">{tLogin('error')}</p>
      )}
      <p className="mt-6 text-center font-body text-xs text-mist/50">
        {tLogin('noAccount')}{' '}
        <Link href="/register" className="text-iris-cyan/80 hover:text-iris-cyan">
          {tLogin('registerLink')}
        </Link>
      </p>
    </div>
  );
}
