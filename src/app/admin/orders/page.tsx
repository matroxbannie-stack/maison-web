'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Inbox, Search } from 'lucide-react'
import { adminFetch } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'
import { CARD, ErrorNotice } from '@/components/admin/dashboard/ui'
import { formatMoney } from '@/components/admin/dashboard/format'
import { OrderDrawer } from '@/components/admin/orders/order-drawer'
import { PaymentBadge, StatusBadge } from '@/components/admin/orders/status-badge'
import { STATUS_TABS, fmtDate, type ListResponse, type OrderRow } from '@/components/admin/orders/order-types'

const SELECT =
  'h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10'

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('')
  const [payment, setPayment] = useState('')
  const [q, setQ] = useState('')
  const [dq, setDq] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<OrderRow[]>([])
  const [meta, setMeta] = useState<ListResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setDq(q.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    adminFetch<ListResponse>('/admin/orders', {
      query: {
        status: status || undefined,
        payment_status: payment || undefined,
        q: dq || undefined,
        per_page: 15,
        page,
      },
      signal: ctrl.signal,
    })
      .then((res) => {
        if (res) {
          setRows(res.data)
          setMeta(res.meta)
        }
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load orders.')
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
    return () => ctrl.abort()
  }, [status, payment, dq, page, reloadKey])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {meta ? meta.total + (meta.total === 1 ? ' order' : ' orders') : 'Loading orders'}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-background p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setStatus(t.value)
                setPage(1)
              }}
              className={cn(
                'h-9 shrink-0 rounded-xl px-4 text-sm font-medium transition',
                status === t.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-72 lg:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order number or email"
              aria-label="Search orders"
              className={cn(SELECT, 'w-full pl-9')}
            />
          </div>
          <select
            value={payment}
            onChange={(e) => {
              setPayment(e.target.value)
              setPage(1)
            }}
            aria-label="Payment status"
            className={SELECT}
          >
            <option value="">All payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {error && <ErrorNotice message={error} onRetry={() => setReloadKey((n) => n + 1)} />}

      <div className={cn(CARD, 'overflow-hidden')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Payment</th>
                <th className="px-3 py-3 text-right font-medium">Items</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                rows.length === 0 &&
                [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-5 animate-pulse rounded-md bg-muted" />
                    </td>
                  </tr>
                ))}
              {rows.map((o) => (
                <tr
                  key={o.order_number}
                  tabIndex={0}
                  onClick={() => setSelected(o.order_number)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelected(o.order_number)
                  }}
                  className={cn(
                    'cursor-pointer border-b border-border outline-none transition last:border-0 hover:bg-muted/60 focus-visible:bg-muted/60',
                    loading && 'opacity-60',
                  )}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(o.placed_at)}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <p>{o.customer_name ?? '-'}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_email ?? ''}</p>
                  </td>
                  <td className="px-3 py-3.5"><StatusBadge status={o.status} /></td>
                  <td className="px-3 py-3.5"><PaymentBadge status={o.payment_status} /></td>
                  <td className="px-3 py-3.5 text-right text-muted-foreground">{o.item_count}</td>
                  <td className="px-5 py-3.5 text-right font-medium">{formatMoney(o.total_minor, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No orders found</p>
            <p className="text-sm text-muted-foreground">Try another status or clear the search.</p>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Page {meta.current_page} of {meta.last_page}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border transition hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= meta.last_page || loading}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border transition hover:bg-muted disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <OrderDrawer
        orderNumber={selected}
        onClose={() => setSelected(null)}
        onChanged={() => setReloadKey((n) => n + 1)}
      />
    </div>
  )
}
