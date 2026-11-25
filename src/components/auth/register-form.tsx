'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { restoreSession } from '@/lib/admin-auth';
import { Field } from '@/components/auth/field';

type Values = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

const EMPTY: Values = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
};

export function RegisterForm() {
  const router = useRouter();
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setGeneral('');

    const local: Record<string, string> = {};
    if (!v.first_name.trim()) local.first_name = 'Enter your first name.';
    if (!v.last_name.trim()) local.last_name = 'Enter your last name.';
    if (!v.email.trim()) local.email = 'Enter your email.';
    if (v.password.length < 8) local.password = 'Use at least 8 characters, with letters and numbers.';
    else if (v.password !== v.password_confirmation)
      local.password_confirmation = 'Passwords do not match.';
    setErrors(local);
    if (Object.keys(local).length > 0) return;

    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({
          ...v,
          first_name: v.first_name.trim(),
          last_name: v.last_name.trim(),
          email: v.email.trim(),
          phone: v.phone.trim(),
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const fieldErrors: Record<string, string> = {};
        if (data?.errors && typeof data.errors === 'object') {
          for (const [k, msgs] of Object.entries(data.errors as Record<string, unknown>)) {
            if (Array.isArray(msgs) && typeof msgs[0] === 'string') fieldErrors[k] = msgs[0];
          }
        }
        setErrors(fieldErrors);
        setGeneral(
          Object.keys(fieldErrors).length > 0
            ? ''
            : (data?.message as string) ?? 'Registration failed. Please try again.',
        );
        setBusy(false);
        return;
      }

      await restoreSession();
      router.push('/account');
    } catch {
      setGeneral('Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14 sm:py-20">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Create account
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Faster checkout, order tracking and a saved wishlist.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="First name"
            name="first_name"
            autoComplete="given-name"
            required
            value={v.first_name}
            onChange={set('first_name')}
            error={errors.first_name}
          />
          <Field
            label="Last name"
            name="last_name"
            autoComplete="family-name"
            required
            value={v.last_name}
            onChange={set('last_name')}
            error={errors.last_name}
          />
        </div>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={v.email}
          onChange={set('email')}
          error={errors.email}
        />
        <Field
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={v.phone}
          onChange={set('phone')}
          error={errors.phone}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={v.password}
          onChange={set('password')}
          error={errors.password}
        />
        <Field
          label="Confirm password"
          name="password_confirmation"
          type="password"
          autoComplete="new-password"
          required
          value={v.password_confirmation}
          onChange={set('password_confirmation')}
          error={errors.password_confirmation}
        />
        <p className="text-xs text-muted-foreground">
          At least 8 characters, with letters and numbers.
        </p>
        {general ? (
          <p role="alert" className="text-sm text-red-600">
            {general}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 w-full items-center justify-center bg-foreground text-xs font-medium uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;