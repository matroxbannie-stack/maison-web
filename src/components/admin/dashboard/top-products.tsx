'use client';

import { CARD, Skeleton } from './ui';
import { formatNumber } from './format';

export type TopProduct = { product_id: number; name: string; units: number; orders: number };

export function TopProducts({
  items,
  loading,
  days,
}: {
  items: TopProduct[] | null;
  loading: boolean;
  days: number;
}) {
  const max = Math.max(1, ...(items ?? []).map((i) => i.units));

  return (
    <div className={CARD + ' p-5 sm:p-6'}>
      <h2 className="font-heading text-lg font-semibold tracking-tight">Top products</h2>
      <p className="mt-1 text-sm text-muted-foreground">Best sellers in the last {days} days</p>

      {loading || !items ? (
        <div className="mt-6 space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 flex h-40 items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground">
          No product sales yet.
        </div>
      ) : (
        <ol className="mt-6 space-y-4">
          {items.map((p, i) => (
            <li key={p.product_id} className="flex items-center gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {formatNumber(p.units)} {p.units === 1 ? 'unit' : 'units'} in {formatNumber(p.orders)}{' '}
                    {p.orders === 1 ? 'order' : 'orders'}
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-foreground" style={{ width: (p.units / max) * 100 + '%' }} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
