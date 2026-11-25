'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout, restoreSession, type AdminUser } from '@/lib/admin-auth';

const SOON = [
  { title: 'Orders', text: 'Track your orders and delivery.' },
  { title: 'Addresses', text: 'Save your delivery addresses.' },
  { title: 'Wishlist', text: 'Keep the pieces you love.' },
];

export function AccountView() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [out, setOut] = useState(false);

  useEffect(() => {
    let active = true;
    restoreSession()
      .then((u) => {
        if (!active) return;
        if (!u) router.replace('/login?next=/account');
        else setUser(u);
      })
      .catch(() => {
        if (active) router.replace('/login?next=/account');
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function signOut() {
    setOut(true);
    await logout();
    router.push('/');
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
        <div className="h-8 w-48 animate-pulse bg-muted" />
        <div className="mt-4 h-4 w-64 animate-pulse bg-muted" />
      </div>
    );
  }

  const staff = user.role === 'admin' || user.role === 'manager';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        My account
      </p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Hello, {user.first_name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>

      <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
        {SOON.map((s) => (
          <li key={s.title} className="bg-background p-6">
            <p className="font-heading text-lg font-semibold tracking-tight">{s.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Coming soon
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button
          type="button"
          onClick={signOut}
          disabled={out}
          className="inline-flex h-12 items-center bg-foreground px-8 text-xs font-medium uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {out ? 'Signing out...' : 'Sign out'}
        </button>
        {staff ? (
          <Link
            href="/admin"
            className="text-xs font-medium uppercase tracking-wider underline underline-offset-8"
          >
            Open admin panel
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default AccountView;