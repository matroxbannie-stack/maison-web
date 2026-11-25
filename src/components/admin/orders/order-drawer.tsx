'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, MapPin, CreditCard, Truck, Clock, Package } from 'lucide-react'
import { adminFetch } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'
import { CARD, ErrorNotice } from '../dashboard/ui'
import { formatMoney } from '../dashboard/format'
import { PaymentBadge, StatusBadge } from './status-badge'
import { NEXT_STATUSES, fmtDate, label, type OrderDetail } from './order-types'
import { StatusDialog } from './status-dialog'

function Block({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className={cn(CARD, 'p-5')}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </section>
  )
}

export function OrderDrawer({
  orderNumber,
  onClose,
  onChanged,
}: {
  orderNumber: string | null
  onClose: () => void
  onChanged: () => void
}) {
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [target, setTarget] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!orderNumber) return
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    adminFetch<{ data: OrderDetail }>('/admin/orders/' + orderNumber, { signal: ctrl.signal })
      .then((res) => {
        if (res) setDetail(res.data)
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load this order.')
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
    return () => ctrl.abort()
  }, [orderNumber, tick])

  useEffect(() => {
    if (!orderNumber) {
      setDetail(null)
      setTarget(null)
    }
  }, [orderNumber])

  const close = useCallback(() => {
    if (!target) onClose()
  }, [target, onClose])

  useEffect(() => {
    if (!orderNumber) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [orderNumber, close])

  if (typeof document === 'undefined') return null

  const d = detail && detail.order_number === orderNumber ? detail : null
  const next = d ? NEXT_STATUSES[d.status] ?? [] : []
  const cur = d?.currency ?? 'USD'
  const money = (n: number) => formatMoney(n, cur)
  const cust = d?.customer
  const customerLine = cust
    ? String(cust.email ?? cust.name ?? cust.first_name ?? 'Registered customer')
    : d?.guest_email
      ? d.guest_email + ' (guest)'
      : '-'

  return createPortal(
    <AnimatePresence>
      {orderNumber && (
        <motion.div
          key="orders-drawer"
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={'Order ' + orderNumber}
            initial={{ x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 48, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-border bg-muted/50 shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-border bg-background px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight">{orderNumber}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {d && <StatusBadge status={d.status} />}
                  {d && <PaymentBadge status={d.payment_status} />}
                  {d && <span className="text-xs text-muted-foreground">Placed {fmtDate(d.placed_at)}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border transition hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {error && <ErrorNotice message={error} onRetry={() => setTick((n) => n + 1)} />}

              {loading && !d && (
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
                  ))}
                </div>
              )}

              {d && (
                <>
                  {next.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {next.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setTarget(s)}
                          className={cn(
                            'h-11 rounded-xl px-5 text-sm font-medium transition',
                            s === 'cancelled'
                              ? 'border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400'
                              : 'bg-foreground text-background hover:opacity-90',
                          )}
                        >
                          {s === 'processing' && 'Start processing'}
                          {s === 'shipped' && 'Mark as shipped'}
                          {s === 'delivered' && 'Mark as delivered'}
                          {s === 'cancelled' && 'Cancel order'}
                        </button>
                      ))}
                    </div>
                  )}

                  <Block icon={Package} title={'Items (' + d.items.length + ')'}>
                    <ul className="divide-y divide-border">
                      {d.items.map((it) => (
                        <li key={it.sku} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                          {it.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.image_url} alt="" className="h-16 w-14 shrink-0 rounded-lg bg-muted object-cover" />
                          ) : (
                            <div className="h-16 w-14 shrink-0 rounded-lg bg-muted" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{it.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {[it.color, it.size && 'Size ' + it.size].filter(Boolean).join(', ')}
                            </p>
                            <p className="text-xs text-muted-foreground">{it.sku}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{money(it.line_total_minor)}</p>
                            <p className="text-xs text-muted-foreground">
                              {it.quantity} x {money(it.unit_price_minor)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                      <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{money(d.subtotal_minor)}</dd></div>
                      {d.discount_minor > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Discount{d.coupon_code ? ' (' + d.coupon_code + ')' : ''}</dt>
                          <dd>-{money(d.discount_minor)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Shipping{d.delivery_method ? ' (' + d.delivery_method + ')' : ''}</dt>
                        <dd>{d.shipping_minor === 0 ? 'Free' : money(d.shipping_minor)}</dd>
                      </div>
                      {d.tax_minor > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{money(d.tax_minor)}</dd></div>}
                      <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>Total</dt><dd>{money(d.total_minor)}</dd></div>
                    </dl>
                  </Block>

                  <Block icon={MapPin} title="Customer and delivery">
                    <p className="text-sm text-muted-foreground">{customerLine}</p>
                    <address className="mt-2 text-sm not-italic leading-relaxed">
                      <p className="font-medium">{d.shipping_address.full_name}</p>
                      {d.shipping_address.phone && <p>{d.shipping_address.phone}</p>}
                      <p>{d.shipping_address.line1}</p>
                      {d.shipping_address.line2 && <p>{d.shipping_address.line2}</p>}
                      <p>
                        {[d.shipping_address.city, d.shipping_address.state, d.shipping_address.postal_code].filter(Boolean).join(', ')}
                      </p>
                      <p>{d.shipping_address.country_code}</p>
                    </address>
                    {d.customer_note && (
                      <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm">Customer note: {d.customer_note}</p>
                    )}
                  </Block>

                  <Block icon={CreditCard} title="Payment">
                    {d.payments.length === 0 && <p className="text-sm text-muted-foreground">No payment record.</p>}
                    <ul className="space-y-2">
                      {d.payments.map((p, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium uppercase">{p.gateway}</span>
                          <span className="text-muted-foreground">{label(p.status)}</span>
                          <span>{formatMoney(p.amount_minor, p.currency_code)}</span>
                        </li>
                      ))}
                    </ul>
                    {d.paid_at && <p className="mt-2 text-xs text-muted-foreground">Paid on {fmtDate(d.paid_at)}</p>}
                  </Block>

                  {d.shipments.length > 0 && (
                    <Block icon={Truck} title="Shipment">
                      {d.shipments.map((s, i) => (
                        <div key={i} className={cn(i > 0 && 'mt-4 border-t border-border pt-4')}>
                          <p className="text-sm font-medium">
                            {s.carrier ?? 'Carrier'} {s.tracking_number ? '- ' + s.tracking_number : ''}
                          </p>
                          {s.estimated_delivery && (
                            <p className="text-xs text-muted-foreground">Estimated delivery {fmtDate(s.estimated_delivery, false)}</p>
                          )}
                          {s.tracking_url && (
                            <a href={s.tracking_url} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-2">
                              Open tracking page
                            </a>
                          )}
                          <ul className="mt-3 space-y-2 border-l border-border pl-4">
                            {s.events.map((ev, j) => (
                              <li key={j} className="text-sm">
                                <p>{ev.description ?? label(ev.status)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {fmtDate(ev.occurred_at)}
                                  {ev.location ? ', ' + ev.location : ''}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </Block>
                  )}

                  <Block icon={Clock} title="History">
                    <ul className="space-y-3 border-l border-border pl-4">
                      {d.status_history.map((h, i) => (
                        <li key={i} className="text-sm">
                          <p className="font-medium">
                            {h.from_status ? label(h.from_status) + ' to ' : ''}
                            {label(h.to_status)}
                          </p>
                          {h.note && <p className="text-muted-foreground">{h.note}</p>}
                          <p className="text-xs text-muted-foreground">
                            {fmtDate(h.created_at)}
                            {h.changed_by_email ? ' by ' + h.changed_by_email : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </Block>
                </>
              )}
            </div>

            {target && orderNumber && (
              <StatusDialog
                orderNumber={orderNumber}
                target={target}
                onClose={() => setTarget(null)}
                onDone={() => {
                  setTarget(null)
                  setTick((n) => n + 1)
                  onChanged()
                }}
              />
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
