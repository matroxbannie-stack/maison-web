'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCartStore, type Cart } from '@/stores/cart-store';
import { text, usd, type DeliveryOption } from '@/lib/checkout';

export function OrderSummary({ cart, delivery }: { cart: Cart; delivery: DeliveryOption | null }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const couponBusy = useCartStore((s) => s.couponBusy);
  const error = useCartStore((s) => s.error);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const couponCode = text(cart.coupon);
  const total = cart.total.amount_minor + (delivery ? delivery.price.amount_minor : 0);

  async function apply() {
    const c = code.trim();
    if (!c) return;
    if (await applyCoupon(c)) setCode('');
  }

  return (
    <aside aria-label="Order summary" className="border border-border bg-muted/40 lg:sticky lg:top-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium lg:hidden"
      >
        <span className="flex items-center gap-2">
          {open ? 'Hide order summary' : 'Show order summary'}
          <ChevronDown className={'h-4 w-4 ' + (open ? 'rotate-180' : '')} />
        </span>
        <span>{usd(total)}</span>
      </button>

      <div className={(open ? 'block' : 'hidden') + ' px-5 pb-6 lg:block lg:pt-6'}>
        <h2 className="hidden text-xs font-semibold uppercase tracking-widest lg:block">
          Order summary ({cart.item_count})
        </h2>

        <ul className="divide-y divide-border">
          {cart.items.map((it) => (
            <li key={it.id} className="flex gap-4 py-4">
              <div className="h-24 w-20 shrink-0 bg-muted">
                {it.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image_url} alt={it.product.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium leading-snug">{it.product.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[text(it.color), text(it.size) ? 'Size ' + text(it.size) : ''].filter(Boolean).join(' / ')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Qty {it.quantity}</p>
                {text(it.issue) ? <p className="mt-1 text-xs text-red-600">{text(it.issue)}</p> : null}
              </div>
              <p className="text-sm">{it.line_total.formatted}</p>
            </li>
          ))}
        </ul>

        {couponCode ? (
          <div className="flex items-center justify-between border border-border bg-background px-3 py-2 text-sm">
            <span>
              Code <strong>{couponCode}</strong> applied
            </span>
            <button
              type="button"
              disabled={couponBusy}
              onClick={() => removeCoupon()}
              className="text-xs underline underline-offset-4 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void apply();
                }
              }}
              placeholder="Promo code"
              aria-label="Promo code"
              className="h-11 min-w-0 flex-1 border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
            />
            <button
              type="button"
              onClick={() => void apply()}
              disabled={couponBusy || !code.trim()}
              className="h-11 border border-foreground px-5 text-xs font-semibold uppercase tracking-widest disabled:opacity-40"
            >
              Apply
            </button>
          </div>
        )}
        {error ? (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {error}
          </p>
        ) : null}

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{cart.subtotal.formatted}</dd>
          </div>
          {cart.discount && cart.discount.amount_minor > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>-{cart.discount.formatted}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{delivery ? (delivery.is_free ? 'Free' : delivery.price.formatted) : '-'}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Estimated total</dt>
            <dd>{usd(total)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">The final amount is confirmed when you place the order.</p>
      </div>
    </aside>
  );
}
