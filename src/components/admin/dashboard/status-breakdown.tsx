'use client';

import { CARD, Skeleton } from './ui';
import { formatNumber } from './format';

const STATUSES = [
  { key: 'pending', label: 'Pending', bar: 'bg-amber-500', dot: 'bg-amber-500' },
  { key: 'processing', label: 'Processing', bar: 'bg-sky-500', dot: 'bg-sky-500' },
  { key: 'shipped', label: 'Shipped', bar: 'bg-violet-500', dot: 'bg-violet-500' },
  { key: 'delivered', label: 'Delivered', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { key: 'cancelled', label: 'Cancelled', bar: 'bg-rose-500', dot: 'bg-rose-500' },
  { key: 'refunded', label: 'Refunded', bar: 'bg-slate-400', dot: 'bg-slate-400' },
];

export function StatusBreakdown({
  data,
  loading,
}: {
  data: Record<string, number> | null;
  loading: boolean;
}) {
  const counts = STATUSES.map((s) => ({ ...s, count: Number(data?.[s.key] ?? 0) }));
  const total = counts.reduce((s, c) => s + c.count, 0);

  return (
    <div className={CARD + ' p-5 sm:p-6'}>
      <h2 className="font-heading text-lg font-semibold tracking-tight">Orders by status</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {loading ? 'Loading...' : formatNumber(total) + ' orders in total'}
      </p>

      {loading ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-3 w-full" />
          {STATUSES.map((s) => (
            <Skeleton key={s.key} className="h-5 w-full" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="mt-6 flex h-40 items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <>
          <div className="mt-6 flex h-3 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label="Orders by status">
            {counts
              .filter((c) => c.count > 0)
              .map((c) => (
                <div key={c.key} className={c.bar} style={{ width: (c.count / total) * 100 + '%' }} />
              ))}
          </div>
          <ul className="mt-5 space-y-3">
            {counts.map((c) => (
              <li key={c.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5">
                  <span className={'h-2.5 w-2.5 rounded-full ' + c.dot} aria-hidden="true" />
                  {c.label}
                </span>
                <span className="flex items-baseline gap-2">
                  <span className="font-medium">{formatNumber(c.count)}</span>
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {total > 0 ? Math.round((c.count / total) * 100) + '%' : '0%'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
