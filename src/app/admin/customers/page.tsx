'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'
import { CARD, ErrorNotice } from '@/components/admin/dashboard/ui'
import { formatMoney } from '@/components/admin/dashboard/format'
import {
  Btn,
  Empty,
  Modal,
  Notice,
  PageHeader,
  Pager,
  Pill,
  RowSkeleton,
  SearchInput,
  SidePanel,
  Tabs,
  TEXTAREA,
} from '@/components/admin/common/kit'
import { errMsg, useAdminList, useDebounced } from '@/components/admin/common/use-admin-list'
import { StatusBadge, PaymentBadge } from '@/components/admin/orders/status-badge'
import { fmtDate } from '@/components/admin/orders/order-types'

type Spent = { currency: string; total_minor: number }
type Customer = {
  id: number
  name: string
  email: string
  phone: string | null
  is_active: boolean
  preferred_currency: string | null
  email_verified: boolean
  last_login_at: string | null
  created_at: string
  orders_count: number
  spent_by_currency: Spent[]
}
type CustomerDetail = Customer & {
  addresses_count: number
  reviews_count: number
  wishlist_count: number
  recent_orders: {
    order_number: string
    status: string
    payment_status: string
    currency: string
    total_minor: number
    placed_at: string
  }[]
}

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
const spentText = (s: Spent[]) => (s.length ? s.map((x) => formatMoney(x.total_minor, x.currency)).join(' + ') : '-')

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

function CustomerPanel({ id, name, onClose, onChanged }: { id: number; name: string; onClose: () => void; onChanged: () => void }) {
  const [d, setD] = useState<CustomerDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    setError(null)
    adminFetch<{ data: CustomerDetail }>('/admin/customers/' + id, { signal: ctrl.signal })
      .then((res) => res && setD(res.data))
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(errMsg(e, 'Could not load this customer.'))
      })
    return () => ctrl.abort()
  }, [id, tick])

  async function setActive(next: boolean) {
    setBusy(true)
    setActionError(null)
    try {
      await adminFetch('/admin/customers/' + id + '/active', {
        method: 'PATCH',
        body: { is_active: next, note: note.trim() || undefined },
      })
      setConfirm(false)
      setNote('')
      setTick((n) => n + 1)
      onChanged()
    } catch (e) {
      setActionError(errMsg(e, 'Could not update the customer.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <SidePanel
      open
      title={d?.name ?? name}
      onClose={onClose}
      subtitle={d && <><span>{d.email}</span><Pill tone={d.is_active ? 'emerald' : 'rose'}>{d.is_active ? 'Active' : 'Inactive'}</Pill></>}
    >
      {error && <ErrorNotice message={error} onRetry={() => setTick((n) => n + 1)} />}
      {!d && !error && <RowSkeleton rows={4} />}
      {d && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Orders" value={d.orders_count} />
            <Stat label="Addresses" value={d.addresses_count} />
            <Stat label="Reviews" value={d.reviews_count} />
            <Stat label="Wishlist" value={d.wishlist_count} />
          </div>
          <section className={cn(CARD, 'space-y-2 p-5 text-sm')}>
            <div className="flex justify-between"><span className="text-muted-foreground">Total spent</span><span className="font-medium">{spentText(d.spent_by_currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{d.phone ?? '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email verified</span><span>{d.email_verified ? 'Yes' : 'No'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>{d.preferred_currency ?? '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{fmtDate(d.created_at)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last login</span><span>{fmtDate(d.last_login_at)}</span></div>
          </section>
          <section className={cn(CARD, 'p-5')}>
            <h3 className="mb-3 text-sm font-semibold">Recent orders</h3>
            {d.recent_orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            <ul className="divide-y divide-border">
              {d.recent_orders.map((o) => (
                <li key={o.order_number} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(o.placed_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <PaymentBadge status={o.payment_status} />
                    <span className="font-medium">{formatMoney(o.total_minor, o.currency)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <Btn variant={d.is_active ? 'danger' : 'primary'} onClick={() => setConfirm(true)}>
            {d.is_active ? 'Deactivate account' : 'Activate account'}
          </Btn>
          <Modal
            open={confirm}
            busy={busy}
            title={d.is_active ? 'Deactivate account' : 'Activate account'}
            onClose={() => setConfirm(false)}
            footer={
              <>
                <Btn variant="ghost" disabled={busy} onClick={() => setConfirm(false)}>Back</Btn>
                <Btn variant={d.is_active ? 'danger' : 'primary'} busy={busy} onClick={() => setActive(!d.is_active)}>
                  {d.is_active ? 'Deactivate' : 'Activate'}
                </Btn>
              </>
            }
          >
            <p className="mb-3 text-sm text-muted-foreground">
              {d.is_active ? 'This customer will not be able to sign in.' : 'This customer will be able to sign in again.'}
            </p>
            <textarea className={TEXTAREA} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
            {actionError && <div className="mt-3"><Notice message={actionError} /></div>}
          </Modal>
        </>
      )}
    </SidePanel>
  )
}

export default function AdminCustomersPage() {
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const dq = useDebounced(q.trim(), 350)
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [dq])
  const { rows, meta, loading, error, reload } = useAdminList<Customer>('/admin/customers', {
    status,
    q: dq || undefined,
    per_page: 15,
    page,
  })
  const [selected, setSelected] = useState<Customer | null>(null)

  return (
    <div className="space-y-5">
      <PageHeader title="Customers" subtitle={meta ? meta.total + (meta.total === 1 ? ' customer' : ' customers') : 'Loading customers'} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          tabs={TABS}
          value={status}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Name or email" />
      </div>
      {error && <ErrorNotice message={error} onRetry={reload} />}
      <div className={cn(CARD, 'overflow-hidden')}>
        {loading && rows.length === 0 && <RowSkeleton />}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className={cn('w-full min-w-[720px] text-left text-sm', loading && 'opacity-60')}>
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Orders</th>
                  <th className="px-3 py-3 text-right font-medium">Spent</th>
                  <th className="px-5 py-3 font-medium">Last login</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    tabIndex={0}
                    onClick={() => setSelected(c)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelected(c)}
                    className="cursor-pointer border-b border-border outline-none transition last:border-0 hover:bg-muted/60 focus-visible:bg-muted/60"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </td>
                    <td className="px-3 py-3.5"><Pill tone={c.is_active ? 'emerald' : 'rose'}>{c.is_active ? 'Active' : 'Inactive'}</Pill></td>
                    <td className="px-3 py-3.5 text-right text-muted-foreground">{c.orders_count}</td>
                    <td className="px-3 py-3.5 text-right font-medium">{spentText(c.spent_by_currency)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{fmtDate(c.last_login_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && rows.length === 0 && <Empty title="No customers found" text="Try another filter or search." />}
        <Pager meta={meta} loading={loading} onPage={setPage} />
      </div>
      {selected && <CustomerPanel key={selected.id} id={selected.id} name={selected.name} onClose={() => setSelected(null)} onChanged={reload} />}
    </div>
  )
}
