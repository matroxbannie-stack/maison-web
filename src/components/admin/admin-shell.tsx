'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BadgePercent,
  ExternalLink,
  GalleryHorizontal,
  Images,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Package,
  ShoppingBag,
  Star,
  Sun,
  Ticket,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';

type NavItem = { label: string; href: string; ready: boolean; icon: LucideIcon };
type NavSection = { label: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    label: 'Menu',
    items: [
      { label: 'Dashboard', href: '/admin', ready: true, icon: LayoutDashboard },
      { label: 'Orders', href: '/admin/orders', ready: true, icon: ShoppingBag },
      { label: 'Products', href: '/admin/products', ready: true, icon: Package },
      { label: 'Reviews', href: '/admin/reviews', ready: true, icon: Star },
      { label: 'Coupons', href: '/admin/coupons', ready: true, icon: Ticket },
      { label: 'Customers', href: '/admin/customers', ready: true, icon: Users },
    ],
  },
  {
    label: 'Storefront',
    items: [
      { label: 'Photos', href: '/admin/photos', ready: true, icon: Images },
      { label: 'Hero', href: '/admin/hero', ready: true, icon: GalleryHorizontal },
      { label: 'Messages', href: '/admin/messages', ready: true, icon: Megaphone },
      { label: 'Deals', href: '/admin/deals', ready: true, icon: BadgePercent },
    ],
  },
];

const NAV: NavItem[] = SECTIONS.flatMap((s) => s.items);

function isActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground font-heading text-sm font-semibold text-background">
        M
      </span>
      <div className="leading-tight">
        <p className="font-heading text-sm font-semibold tracking-wide">MAISON</p>
        <p className="text-xs text-muted-foreground">Admin</p>
      </div>
    </div>
  );
}

function initialsOf(first?: string, last?: string) {
  const v = ((first ?? '').charAt(0) + (last ?? '').charAt(0)).toUpperCase();
  return v || 'A';
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { user, logout } = useAdminAuth();
  const [busy, setBusy] = useState(false);
  const fullName = user ? (user.first_name + ' ' + user.last_name).trim() : '';

  async function onLogout() {
    setBusy(true);
    try {
      await logout();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Admin">
        {SECTIONS.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">{section.label}</p>
            {section.items.map((item) => {
              const Icon = item.icon;
              if (!item.ready) {
                return (
                  <span
                    key={item.href}
                    aria-disabled="true"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/70"
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">Soon</span>
                  </span>
                );
              }
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ' +
                    (active
                      ? 'bg-foreground text-background shadow-[0_6px_16px_-6px_rgba(0,0,0,0.4)]'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground')
                  }
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
            {initialsOf(user?.first_name, user?.last_name)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{fullName || 'Admin'}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{user?.role}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={busy}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeButton() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('maison_theme', next ? 'dark' : 'light');
    } catch {
      // ignore
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const current = NAV.find((n) => isActive(pathname, n.href));
  const title = current ? current.label : 'Admin';

  return (
    <div className="min-h-screen bg-muted/50">
      <aside className="hidden border-r border-border bg-background lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-64">
        <SidebarContent pathname={pathname} />
      </aside>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[280px] bg-background shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: reduce ? 0 : 0.25, ease: 'easeOut' }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-heading text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
            >
              View store
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
            <ThemeButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}