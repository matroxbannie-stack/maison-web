'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { text, useLastOrder } from '@/lib/checkout';

const BUTTON =
  'inline-flex h-12 items-center bg-foreground px-8 text-xs font-semibold uppercase tracking-widest text-background';

export function ConfirmationView() {
  const order = useLastOrder((s) => s.order);
  const address = useLastOrder((s) => s.address);

  if (!order || !address) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">No recent order to show</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Order details are shown once, right after checkout. Contact us if you need help with an order.
        </p>
        <Link href="/" className={BUTTON + ' mt-8'}>
          Back to shop
        </Link>
      </div>
    );
  }

  const t = order.totals;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12" strokeWidth={1} />
        <h1 className="font-heading mt-4 text-3xl font-semibold tracking-tight">Thank you for your order</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Order number <strong className="text-foreground">{order.order_number}</strong>
        </p>
        <p className="text-sm text-muted-foreground">Placed for {order.email}. Please keep your order number.</p>
      </div>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {order.items.map((it) => (
          <li key={it.sku} className="flex gap-4 py-4">
            <div className="h-24 w-20 shrink-0 bg-muted">
              {it.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image_url} alt={it.product_name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium">{it.product_name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {[text(it.color), text(it.size) ? 'Size ' + text(it.size) : ''].filter(Boolean).join(' / ')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Qty {it.quantity}</p>
            </div>
            <p className="text-sm">{it.line_total.formatted}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{t.subtotal.formatted}</dd>
        </div>
        {t.discount.amount_minor > 0 ? (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd>-{t.discount.formatted}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd>{t.shipping.formatted}</dd>
        </div>
        {t.tax.amount_minor > 0 ? (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd>{t.tax.formatted}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <dt>Total (pay on delivery)</dt>
          <dd>{t.total.formatted}</dd>
        </div>
      </dl>

      <div className="mt-8 bg-muted p-5 text-sm">
        <p className="text-xs font-semibold uppercase tracking-widest">Delivering to</p>
        <p className="mt-3">{address.full_name}</p>
        <p>{[address.line1, address.line2].filter(Boolean).join(', ')}</p>
        <p>{[address.city, address.state, address.postal_code, address.country_code].filter(Boolean).join(', ')}</p>
        <p>{address.phone}</p>
      </div>

      <div className="mt-10 text-center">
        <Link href="/" className={BUTTON}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
