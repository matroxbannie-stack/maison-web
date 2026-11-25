import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminAuthProvider } from '@/components/admin/admin-auth-provider';
import { AdminGate } from '@/components/admin/admin-gate';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted">
      <AdminAuthProvider>
        <AdminGate>{children}</AdminGate>
      </AdminAuthProvider>
    </div>
  );
}