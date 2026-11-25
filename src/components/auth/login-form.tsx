'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { login } from '@/lib/admin-auth';
import { Field } from '@/components/auth/field';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/account');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14 sm:py-20">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Sign in</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Welcome back. Sign in to see your account.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy || !email || !password}
          className="inline-flex h-12 w-full items-center justify-center bg-foreground text-xs font-medium uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        New to MAISON?{' '}
        <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;