'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';

type Props = {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

function SiteShellInner({ header, footer, children }: Props) {
  const pathname = usePathname() ?? '';
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  // Distraction-free checkout, like the large international stores.
  if (pathname === '/checkout') {
    return (
      <>
        <header className="border-b border-border">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
              MAISON
            </Link>
            <Link href="/" className="text-xs underline underline-offset-4">
              Continue shopping
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          <Link href="/shipping-returns" className="underline underline-offset-4">
            Shipping and returns
          </Link>
          <span className="mx-3">|</span>
          <Link href="/contact" className="underline underline-offset-4">
            Contact us
          </Link>
        </footer>
      </>
    );
  }

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}

export function SiteShell(props: Props) {
  return (
    <Suspense fallback={<main className="flex-1">{props.children}</main>}>
      <SiteShellInner {...props} />
    </Suspense>
  );
}