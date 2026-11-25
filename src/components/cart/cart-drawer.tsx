'use client'

import Link from 'next/link'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'

function pick(v: unknown, keys: string[]): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    for (const k of keys) {
      const x = o[k]
      if (typeof x === 'string') return x
    }
  }
  return ''
}

export function CartDrawer() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const open = useCartStore((s) => s.open)
  const cart = useCartStore((s) => s.cart)
  const loading = useCartStore((s) => s.loading)
  const busyId = useCartStore((s) => s.busyId)
  const couponBusy = useCartStore((s) => s.couponBusy)
  const error = useCartStore((s) => s.error)
  const closeDrawer = useCartStore((s) => s.closeDrawer)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const applyCoupon = useCartStore((s) => s.applyCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)

  const [code, setCode] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, closeDrawer])

  if (!mounted) return null

  const items = cart ? cart.items : []
  const couponCode = cart ? pick(cart.coupon, ['code']) : ''
  const hasDiscount = !!cart && !!cart.discount && cart.discount.amount_minor > 0

  async function onApply(e: React.FormEvent) {
    e.preventDefault()
    const c = code.trim()
    if (!c) return
    const ok = await applyCoupon(c)
    if (ok) setCode('')
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-border bg-background shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest">
                Bag{cart && cart.item_count > 0 ? ' (' + cart.item_count + ')' : ''}
              </h2>
              <button
                type="button"
                aria-label="Close bag"
                onClick={closeDrawer}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {error ? (
              <p role="alert" className="border-b border-border bg-muted px-5 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" strokeWidth={1} />
                <p className="text-sm text-muted-foreground">
                  {loading && !cart ? 'Loading your bag...' : 'Your bag is empty.'}
                </p>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="h-11 border border-foreground px-6 text-xs font-semibold uppercase tracking-widest hover:bg-foreground hover:text-background"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
                  {items.map((it) => {
                    const color = pick(it.color, ['name', 'label'])
                    const size = pick(it.size, ['label', 'name'])
                    const issue = pick(it.issue, ['message', 'label'])
                    const busy = busyId === it.id
                    return (
                      <li key={it.id} className={'flex gap-4 py-5 ' + (busy ? 'opacity-50' : '')}>
                        <Link
                          href={'/p/' + it.product.slug}
                          onClick={closeDrawer}
                          className="block h-28 w-24 shrink-0 bg-muted"
                        >
                          {it.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={it.image_url}
                              alt={it.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              href={'/p/' + it.product.slug}
                              onClick={closeDrawer}
                              className="text-sm font-medium leading-snug hover:opacity-70"
                            >
                              {it.product.name}
                            </Link>
                            <p className="shrink-0 text-sm">{it.line_total.formatted}</p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {[color, size ? 'Size ' + size : ''].filter(Boolean).join(' / ')}
                          </p>
                          <p className="text-xs text-muted-foreground">{it.unit_price.formatted}</p>
                          {issue ? <p className="mt-1 text-xs text-red-600">{issue}</p> : null}
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="inline-flex items-center border border-border">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                disabled={busy}
                                onClick={() => setQty(it.id, it.quantity - 1)}
                                className="inline-flex h-8 w-8 items-center justify-center hover:bg-muted disabled:opacity-40"
                              >
                                <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                              </button>
                              <span className="w-8 text-center text-sm">{it.quantity}</span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                disabled={busy || it.quantity >= it.max_quantity}
                                onClick={() => setQty(it.id, it.quantity + 1)}
                                className="inline-flex h-8 w-8 items-center justify-center hover:bg-muted disabled:opacity-40"
                              >
                                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                              </button>
                            </div>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => remove(it.id)}
                              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground disabled:opacity-40"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="border-t border-border px-5 py-5">
                  {couponCode ? (
                    <div className="mb-4 flex items-center justify-between bg-muted px-3 py-2 text-sm">
                      <span>
                        Code <strong className="font-semibold">{couponCode}</strong> applied
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
                    <form onSubmit={onApply} className="mb-4 flex gap-2">
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Promo code"
                        aria-label="Promo code"
                        className="h-10 min-w-0 flex-1 border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
                      />
                      <button
                        type="submit"
                        disabled={couponBusy || !code.trim()}
                        className="h-10 border border-foreground px-4 text-xs font-semibold uppercase tracking-widest hover:bg-foreground hover:text-background disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd>{cart ? cart.subtotal.formatted : ''}</dd>
                    </div>
                    {hasDiscount && cart && cart.discount ? (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Discount</dt>
                        <dd>-{cart.discount.formatted}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Shipping</dt>
                      <dd>{cart && cart.free_shipping ? 'Free' : 'Calculated at checkout'}</dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                      <dt>Total</dt>
                      <dd>{cart ? cart.total.formatted : ''}</dd>
                    </div>
                  </dl>

                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    aria-disabled={cart ? !cart.checkout_ready : true}
                    className={
                      'mt-5 flex h-12 w-full items-center justify-center bg-foreground text-xs font-semibold uppercase tracking-widest text-background hover:opacity-90 ' +
                      (cart && !cart.checkout_ready ? 'pointer-events-none opacity-40' : '')
                    }
                  >
                    Checkout
                  </Link>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Cash on delivery available
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}