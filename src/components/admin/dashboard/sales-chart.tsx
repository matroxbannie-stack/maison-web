'use client';

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CARD, ErrorNotice, Skeleton } from './ui';
import { decimalsFor, formatCompact, formatMoney, formatNumber, shortDate, toMajor } from './format';

export type DailyPoint = {
  date: string;
  orders: number;
  gross_minor_by_currency: Record<string, number> | unknown[];
};

type Metric = 'orders' | 'revenue';

function gross(p: DailyPoint, currency: string): number {
  const g = p.gross_minor_by_currency;
  if (!g || Array.isArray(g)) return 0;
  return (g as Record<string, number>)[currency] ?? 0;
}

function niceMax(v: number): number {
  if (v <= 0) return 4;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return n * exp;
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ' +
            (o.value === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground')
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SalesChart({
  daily,
  loading,
  error,
  days,
  onDays,
  onRetry,
}: {
  daily: DailyPoint[] | null;
  loading: boolean;
  error: string | null;
  days: number;
  onDays: (d: number) => void;
  onRetry: () => void;
}) {
  const reduce = useReducedMotion();
  const [metric, setMetric] = useState<Metric>('orders');
  const [picked, setPicked] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const currencies = useMemo(() => {
    const set = new Set<string>();
    for (const p of daily ?? []) {
      const g = p.gross_minor_by_currency;
      if (g && !Array.isArray(g)) Object.keys(g).forEach((k) => set.add(k));
    }
    return Array.from(set).sort();
  }, [daily]);

  const currency = picked && currencies.includes(picked) ? picked : (currencies[0] ?? 'USD');
  const points = daily ?? [];
  const useRevenue = metric === 'revenue';

  const values = points.map((p) => (useRevenue ? toMajor(gross(p, currency), currency) : p.orders));
  const maxVal = Math.max(0, ...values);
  const top = useRevenue ? niceMax(maxVal) : Math.max(4, Math.ceil(maxVal / 4) * 4);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => top * f);

  const totalOrders = points.reduce((s, p) => s + p.orders, 0);
  const totalRevenueMinor = points.reduce((s, p) => s + gross(p, currency), 0);

  const step = Math.max(1, Math.ceil(points.length / 7));
  const hp = hover !== null ? points[hover] : null;

  return (
    <div className={CARD + ' p-5 sm:p-6'}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">Sales overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading || !daily
              ? 'Loading...'
              : hp
                ? shortDate(hp.date) +
                  ': ' +
                  formatNumber(hp.orders) +
                  (hp.orders === 1 ? ' order' : ' orders') +
                  (currencies.length ? ', ' + formatMoney(gross(hp, currency), currency) : '')
                : formatNumber(totalOrders) +
                  ' orders in the last ' +
                  days +
                  ' days' +
                  (currencies.length ? ', ' + formatMoney(totalRevenueMinor, currency) : '')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented<Metric>
            label="Metric"
            value={metric}
            onChange={setMetric}
            options={[
              { value: 'orders', label: 'Orders' },
              { value: 'revenue', label: 'Revenue' },
            ]}
          />
          {useRevenue && currencies.length > 1 ? (
            <Segmented<string>
              label="Currency"
              value={currency}
              onChange={setPicked}
              options={currencies.map((c) => ({ value: c, label: c }))}
            />
          ) : null}
          <Segmented<number>
            label="Period"
            value={days}
            onChange={onDays}
            options={[
              { value: 7, label: '7d' },
              { value: 30, label: '30d' },
              { value: 90, label: '90d' },
            ]}
          />
        </div>
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorNotice message={error} onRetry={onRetry} />
        ) : loading || !daily ? (
          <Skeleton className="h-64 w-full" />
        ) : points.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground">
            No sales in this period yet.
          </div>
        ) : (
          <div className="flex gap-3" onMouseLeave={() => setHover(null)}>
            <div
              className="flex h-56 w-12 shrink-0 flex-col justify-between text-right text-[11px] text-muted-foreground"
              aria-hidden="true"
            >
              {ticks.map((t, i) => (
                <span key={i} className="leading-none">
                  {useRevenue ? formatCompact(t) : formatNumber(Math.round(t))}
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative h-56">
                <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
                  {ticks.map((_, i) => (
                    <div key={i} className="border-t border-dashed border-border" />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-end gap-[3px]">
                  {points.map((p, i) => {
                    const pct = top > 0 ? (values[i] / top) * 100 : 0;
                    const active = hover === i;
                    return (
                      <button
                        key={p.date}
                        type="button"
                        onMouseEnter={() => setHover(i)}
                        onFocus={() => setHover(i)}
                        onBlur={() => setHover(null)}
                        aria-label={
                          shortDate(p.date) +
                          ': ' +
                          (useRevenue ? formatMoney(gross(p, currency), currency) : p.orders + ' orders')
                        }
                        className="group flex h-full flex-1 items-end outline-none"
                      >
                        <motion.span
                          key={metric + currency + days}
                          initial={reduce ? false : { height: 0 }}
                          animate={{ height: Math.max(pct, values[i] > 0 ? 2 : 0) + '%' }}
                          transition={{ duration: 0.5, delay: reduce ? 0 : Math.min(i * 0.012, 0.4), ease: [0.22, 1, 0.36, 1] }}
                          className={
                            'block w-full rounded-t-md transition-colors ' +
                            (active ? 'bg-foreground' : 'bg-foreground/70 group-hover:bg-foreground')
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 flex gap-[3px] text-[11px] text-muted-foreground" aria-hidden="true">
                {points.map((p, i) => (
                  <span key={p.date} className="relative h-4 flex-1">
                    {i % step === 0 ? (
                      <span className="absolute left-0 whitespace-nowrap">{shortDate(p.date)}</span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {useRevenue && currencies.length === 0 && !loading && daily && points.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          No revenue recorded. Decimals for {currency}: {decimalsFor(currency)}.
        </p>
      ) : null}
    </div>
  );
}
