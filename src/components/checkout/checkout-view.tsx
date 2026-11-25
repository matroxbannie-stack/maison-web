'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { Banknote, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { getCartToken } from '@/lib/cart-token';
import { useCartStore } from '@/stores/cart-store';
import { OrderSummary } from '@/components/checkout/order-summary';
import {
  checkoutSchema,
  COUNTRIES,
  EMPTY_FORM,
  useLastOrder,
  type CheckoutForm,
  type DeliveryOption,
  type PlacedOrder,
} from '@/lib/checkout';

type Errors = Partial<Record<keyof CheckoutForm, string>>;

const INPUT = 'h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ';

function Field({
  name,
  label,
  value,
  error,
  onValue,
  className,
  ...rest
}: {
  name: keyof CheckoutForm;
  label: string;
  value: string;
  error?: string;
  onValue: (name: keyof CheckoutForm, value: string) => void;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'value' | 'onChange'>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-xs font-medium">
        {label}
      </label>
      <input
        {...rest}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onValue(name, e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? name + '-error' : undefined}
        className={INPUT + (error ? 'border-red-600' : 'border-border')}
      />
      {error ? (
        <p id={name + '-error'} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <h2 className="mb-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs text-background">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const cartError = useCartStore((s) => s.error);
  const couponBusy = useCartStore((s) => s.couponBusy);
  const refresh = useCartStore((s) => s.refresh);
  const saveOrder = useLastOrder((s) => s.save);

  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [options, setOptions] = useState<DeliveryOption[] | null>(null);
  const [optionsError, setOptionsError] = useState('');
  const [method, setMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');
  const attempt = useRef<{ signature: string; key: string } | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const country = form.country_code;
  const cartKey = cart ? cart.subtotal.amount_minor + ':' + cart.total.amount_minor + ':' + cart.item_count : '';

  useEffect(() => {
    if (!cartKey) return;
    const controller = new AbortController();
    api<{ data: DeliveryOption[] }>('checkout/delivery-options', {
      query: { country },
      cartToken: getCartToken(),
      currency: 'USD',
      signal: controller.signal,
    })
      .then((res) => {
        setOptions(res.data);
        setOptionsError('');
        setMethod((current) =>
          res.data.some((o) => o.code === current) ? current : (res.data[0]?.code ?? ''),
        );
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setOptions([]);
        setMethod('');
        setOptionsError(e instanceof Error ? e.message : 'Could not load delivery options.');
      });
    return () => controller.abort();
  }, [country, cartKey]);

  function change(name: keyof CheckoutForm, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  }

  const delivery = options?.find((o) => o.code === method) ?? null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting || !cart) return;
    setMessage('');

    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CheckoutForm;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }
    if (!delivery) {
      setMessage('Please choose a delivery method.');
      return;
    }

    const v = parsed.data;
    const body = {
      email: v.email,
      delivery_method: delivery.code,
      payment_method: 'cod',
      shipping: {
        full_name: v.full_name,
        phone: v.phone,
        line1: v.line1,
        line2: v.line2 || null,
        city: v.city,
        state: v.state || null,
        postal_code: v.postal_code,
        country_code: v.country_code,
      },
      customer_note: v.customer_note || null,
    };

    // The same order sent twice reuses the same key, so it is created only once.
    const signature = JSON.stringify(body) + cartKey;
    if (!attempt.current || attempt.current.signature !== signature) {
      attempt.current = { signature, key: crypto.randomUUID() };
    }

    setSubmitting(true);
    try {
      const res = await api<{ data: PlacedOrder }>('checkout/orders', {
        method: 'POST',
        body,
        cartToken: getCartToken(),
        currency: 'USD',
        idempotencyKey: attempt.current.key,
      });
      setDone(true);
      saveOrder(res.data, v);
      try {
        window.localStorage.removeItem('maison_cart_token');
      } catch {
        // storage blocked: nothing to clear
      }
      useCartStore.setState({ cart: null, open: false, error: null });
      router.replace('/order-confirmation');
    } catch (err) {
      if (err instanceof ApiError) {
        const next: Errors = {};
        for (const [key, list] of Object.entries(err.errors ?? {})) {
          next[key.replace('shipping.', '') as keyof CheckoutForm] = list[0];
        }
        setErrors(next);
        setMessage(err.message);
        void refresh();
      } else {
        setMessage('Could not reach the server. Please try again.');
      }
      setSubmitting(false);
    }
  }

  const wrap = 'mx-auto w-full max-w-6xl px-4 py-10 sm:px-6';

  if (done) {
    return <div className={wrap + ' text-sm text-muted-foreground'}>Confirming your order...</div>;
  }

  if (!cart) {
    return (
      <div className={wrap}>
        {cartError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600">{cartError}</p>
            <button type="button" onClick={() => void refresh()} className="mt-4 text-sm underline">
              Try again
            </button>
          </div>
        ) : (
          <div aria-label="Loading checkout" className="space-y-4">
            <div className="h-8 w-48 animate-pulse bg-muted" />
            <div className="h-64 animate-pulse bg-muted" />
          </div>
        )}
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className={wrap + ' py-24 text-center'}>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Your bag is empty</h1>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center bg-foreground px-8 text-xs font-semibold uppercase tracking-widest text-background"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const field = (name: keyof CheckoutForm) => ({
    name,
    value: form[name],
    error: errors[name],
    onValue: change,
  });

  return (
    <div className={wrap}>
      <h1 className="font-heading mb-8 text-3xl font-semibold tracking-tight">Checkout</h1>
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:order-2 lg:col-span-2">
          <OrderSummary cart={cart} delivery={delivery} />
        </div>

        <form onSubmit={submit} noValidate className="lg:order-1 lg:col-span-3">
          <Section n={1} title="Contact">
            <Field {...field('email')} label="Email" type="email" autoComplete="email" />
            <p className="mt-2 text-xs text-muted-foreground">Used for your order details.</p>
          </Section>

          <Section n={2} title="Shipping address">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field {...field('full_name')} label="Full name" autoComplete="name" />
              <Field {...field('phone')} label="Phone" type="tel" autoComplete="tel" />
              <Field {...field('line1')} label="Address" autoComplete="address-line1" className="sm:col-span-2" />
              <Field
                {...field('line2')}
                label="Apartment, suite (optional)"
                autoComplete="address-line2"
                className="sm:col-span-2"
              />
              <Field {...field('city')} label="City" autoComplete="address-level2" />
              <Field {...field('state')} label="State / Province (optional)" autoComplete="address-level1" />
              <Field {...field('postal_code')} label="Postal code" autoComplete="postal-code" />
              <div>
                <label htmlFor="country_code" className="mb-1.5 block text-xs font-medium">
                  Country
                </label>
                <select
                  id="country_code"
                  value={form.country_code}
                  autoComplete="country"
                  onChange={(e) => change('country_code', e.target.value)}
                  className={INPUT + 'border-border'}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.country_code ? <p className="mt-1 text-xs text-red-600">{errors.country_code}</p> : null}
              </div>
            </div>
          </Section>

          <Section n={3} title="Delivery method">
            {options === null ? (
              <div className="h-24 animate-pulse bg-muted" />
            ) : options.length === 0 ? (
              <p className="text-sm text-red-600">{optionsError || 'No delivery option for this country.'}</p>
            ) : (
              <div role="radiogroup" aria-label="Delivery method" className="space-y-3">
                {options.map((o) => (
                  <label
                    key={o.code}
                    className={
                      'flex cursor-pointer items-center gap-4 border p-4 ' +
                      (method === o.code ? 'border-foreground' : 'border-border')
                    }
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={method === o.code}
                      onChange={() => setMethod(o.code)}
                      className="accent-current"
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{o.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {o.min_days === o.max_days ? o.min_days : o.min_days + '-' + o.max_days}
                        {o.max_days === 1 ? ' day' : ' days'}
                        {o.description ? ' - ' + o.description : ''}
                      </span>
                    </span>
                    <span className="text-sm font-medium">{o.is_free ? 'Free' : o.price.formatted}</span>
                  </label>
                ))}
              </div>
            )}
          </Section>

          <Section n={4} title="Payment">
            <div className="flex items-center gap-4 border border-foreground p-4">
              <Banknote className="h-6 w-6" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay in cash when your order arrives.</p>
              </div>
            </div>
          </Section>

          <Section n={5} title="Review and place order">
            <label htmlFor="customer_note" className="mb-1.5 block text-xs font-medium">
              Order note (optional)
            </label>
            <textarea
              id="customer_note"
              rows={3}
              maxLength={500}
              value={form.customer_note}
              onChange={(e) => change('customer_note', e.target.value)}
              className="w-full border border-border bg-background p-3 text-sm outline-none focus:border-foreground"
            />

            {message ? (
              <p role="alert" className="mt-4 border border-red-600 p-3 text-sm text-red-600">
                {message}
              </p>
            ) : null}
            {!cart.checkout_ready ? (
              <p className="mt-4 text-sm text-red-600">Please fix the items in your bag before ordering.</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || couponBusy || !delivery || !cart.checkout_ready}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 bg-foreground text-xs font-semibold uppercase tracking-widest text-background hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Placing order...' : 'Place order'}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              By placing your order you agree to our{' '}
              <Link href="/terms" target="_blank" className="underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </Section>
        </form>
      </div>
    </div>
  );
}
