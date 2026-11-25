'use client';

import { useState, type ReactNode } from 'react';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { LoginScreen } from '@/components/admin/login-screen';

const ADMIN_ROLES = ['admin', 'manager'];

function NoAccess() {
  const { logout } = useAdminAuth();
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm border border-border bg-background p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em]">MAISON</p>
        <h1 className="mt-6 text-lg font-semibold">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This account does not have permission to use the admin panel.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await logout();
            } finally {
              setBusy(false);
            }
          }}
          className="mt-6 h-11 w-full bg-foreground text-xs font-semibold uppercase tracking-widest text-background disabled:opacity-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminGate({ children }: { children: ReactNode }) {
  const { status, user } = useAdminAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          role="status"
          aria-label="Loading"
          className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground"
        />
      </div>
    );
  }

  if (status === 'anonymous' || !user) return <LoginScreen />;
  if (!ADMIN_ROLES.includes(user.role)) return <NoAccess />;

  return <AdminShell>{children}</AdminShell>;
}