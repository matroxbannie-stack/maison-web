'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingBag,
  Star,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';
import { adminFetch } from '@/lib/admin-auth';
import { StatCard } from '@/components/admin/dashboard/stat-card';
import { SalesChart, type DailyPoint } from '@/components/admin/dashboard/sales-chart';
import { StatusBreakdown } from '@/components/admin/dashboard/status-breakdown';
import { TopProducts, type TopProduct } from '@/components/admin/dashboard/top-products';
import { CARD, ErrorNotice, FadeIn, Skeleton } from '@/components/admin/dashboard/ui';
import { formatMoney, formatNumber } from '@/components/admin/dashboard/format';

type Summary = {
  orders_total: number;
  orders_today: number;
  orders_by_status: Record<string, number>;
  revenue_by_currency: { currency: string; orders: number; gross_minor: number; paid_minor: number }[];
  customers: number;
  low_stock_variants: number;
  pending_reviews: number;
};

type Sales = {
  days: number;
  from: string;
  to: string;
  daily: DailyPoint[];
  top_products: TopProduct[];
};

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong. Please try again.';
}

function isAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}

const LINKS = [
  { label: 'Orders', text: 'Review and update orders', href: '/admin/orders', icon: ShoppingBag, ready: true },
  { label: 'Products', text: 'Stock and product catalogue', href: '/admin/products', icon: Package, ready: true },
  { label: 'Reviews', text: 'Moderate customer reviews', href: '/admin/reviews', icon: Star, ready: true },
  { label: 'Coupons', text: 'Create and manage promo codes', href: '/admin/coupons', icon: Ticket, ready: true },
];

export default function AdminHome() {
  const { user } = useAdminAuth();
  const [days, setDays] = useState(30);
  const [tick, setTick] = useState(0);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryBusy, setSummaryBusy] = useState(true);

  const [sales, setSales] = useState<Sales | null>(null);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [salesBusy, setSalesBusy] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setSummaryBusy(true);
    setSummaryError(null);
    adminFetch<{ data: Summary }>('/admin/dashboard/summary', { signal: ctrl.signal })
      .then((r) => setSummary(r.data))
      .catch((e) => {
        if (!isAbort(e)) setSummaryError(errMsg(e));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setSummaryBusy(false);
      });
    return () => ctrl.abort();
  }, [tick]);

  useEffect(() => {
    const ctrl = new AbortController();
    setSalesBusy(true);
    setSalesError(null);
    adminFetch<{ data: Sales }>('/admin/dashboard/sales', { query: { days }, signal: ctrl.signal })
      .then((r) => setSales(r.data))
      .catch((e) => {
        if (!isAbort(e)) setSalesError(errMsg(e));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setSalesBusy(false);
      });
    return () => ctrl.abort();
  }, [tick, days]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }, []);

  const refresh = () => setTick((t) => t + 1);
  const busy = summaryBusy || salesBusy;
  const sumLoading = summaryBusy && !summary;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {greeting}
              {user?.first_name ? ', ' + user.first_name : ''}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Here is how the store is doing today.</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw className={'h-4 w-4 ' + (busy ? 'animate-spin' : '')} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </FadeIn>

      {summaryError ? <ErrorNotice message={summaryError} onRetry={refresh} /> : null}

      <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total orders"
          value={formatNumber(summary?.orders_total ?? 0)}
          hint={formatNumber(summary?.orders_today ?? 0) + ' placed today'}
          icon={ShoppingBag}
          tone="sky"
          loading={sumLoading}
          delay={0.02}
        />
        <StatCard
          label="Customers"
          value={formatNumber(summary?.customers ?? 0)}
          hint="Registered accounts"
          icon={Users}
          tone="emerald"
          loading={sumLoading}
          delay={0.06}
        />
        <StatCard
          label="Low stock"
          value={formatNumber(summary?.low_stock_variants ?? 0)}
          hint="Variants to restock"
          icon={AlertTriangle}
          tone="amber"
          loading={sumLoading}
          delay={0.1}
        />
        <StatCard
          label="Pending reviews"
          value={formatNumber(summary?.pending_reviews ?? 0)}
          hint="Waiting for moderation"
          icon={MessageSquare}
          tone="violet"
          loading={sumLoading}
          delay={0.14}
        />
      </section>

      <section aria-label="Revenue">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Revenue by currency</h3>
        {sumLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-36" />
            <Skeleton className="hidden h-36 md:block" />
          </div>
        ) : !summary || summary.revenue_by_currency.length === 0 ? (
          <div className={CARD + ' flex h-28 items-center justify-center text-sm text-muted-foreground'}>
            No revenue yet. Cancelled and refunded orders are not counted.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summary.revenue_by_currency.map((r, i) => {
              const pct = r.gross_minor > 0 ? Math.round((r.paid_minor / r.gross_minor) * 100) : 0;
              return (
                <FadeIn key={r.currency} delay={0.05 * i}>
                  <div className={CARD + ' p-5'}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{r.currency} sales</p>
                        <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                          {formatMoney(r.gross_minor, r.currency)}
                        </p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Wallet className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: pct + '%' }} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatMoney(r.paid_minor, r.currency)} paid ({pct}%) from {formatNumber(r.orders)}{' '}
                      {r.orders === 1 ? 'order' : 'orders'}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}
      </section>

      <section aria-label="Sales" className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart
            daily={sales?.daily ?? null}
            loading={salesBusy && !sales}
            error={salesError}
            days={days}
            onDays={setDays}
            onRetry={refresh}
          />
        </div>
        <StatusBreakdown data={summary?.orders_by_status ?? null} loading={sumLoading} />
      </section>

      <section aria-label="Products and shortcuts" className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TopProducts items={sales?.top_products ?? null} loading={salesBusy && !sales} days={days} />
        </div>
        <div className={CARD + ' p-5 sm:p-6'}>
          <h2 className="font-heading text-lg font-semibold tracking-tight">Quick links</h2>
          <p className="mt-1 text-sm text-muted-foreground">Jump to the tools you use most.</p>
          <ul className="mt-5 space-y-2">
            {LINKS.map((l) => {
              const Icon = l.icon;
              const inner = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{l.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{l.text}</span>
                  </span>
                  {l.ready ? (
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Soon
                    </span>
                  )}
                </>
              );
              return (
                <li key={l.href}>
                  {l.ready ? (
                    <Link
                      href={l.href}
                      className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="flex items-center gap-3 rounded-xl border border-border p-3 opacity-70"
                    >
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
