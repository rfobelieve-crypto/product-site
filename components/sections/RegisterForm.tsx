'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Status = 'idle' | 'submitting' | 'error' | 'done';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus('error');
      setErrorMsg('Passwords don’t match.');
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
        setErrorMsg(
          data.error === 'email already registered'
            ? 'That email is already registered — try signing in instead.'
            : data.error === 'password must be at least 8 characters'
              ? 'Password needs to be at least 8 characters.'
              : 'Something went wrong — try again shortly.',
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
      setErrorMsg('Network error — try again shortly.');
    }
  }

  if (status === 'done') {
    return (
      <p className="mx-auto max-w-sm text-center font-body text-sm text-iris-cyan">
        Account created.{' '}
        <Link href="/login" className="underline hover:text-mist">
          Sign in
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
          placeholder="you@domain.com"
          className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min. 8 characters)"
          className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none"
        />
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="w-full rounded-full border border-white/15 bg-ink/60 px-5 py-2.5 font-body text-sm text-mist placeholder:text-mist/35 focus:border-iris-cyan/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="mt-2 rounded-full bg-mist px-6 py-2.5 font-body text-sm font-medium text-void transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {status === 'submitting' ? 'Creating account…' : 'Register'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-3 font-body text-xs text-iris-rose">{errorMsg}</p>
      )}
      <p className="mt-6 text-center font-body text-xs text-mist/50">
        Already have an account?{' '}
        <Link href="/login" className="text-iris-cyan/80 hover:text-iris-cyan">
          Sign in
        </Link>
      </p>
    </div>
  );
}
