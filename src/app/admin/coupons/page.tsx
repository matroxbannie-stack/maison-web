'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { adminFetch } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'
import { CARD, ErrorNotice } from '@/components/admin/dashboard/ui'
import { formatMoney } from '@/components/admin/dashboard/format'
import { Btn, Empty, Notice, PageHeader, Pager, Pill, RowSkeleton, SearchInput, Tabs } from '@/components/admin/common/kit'
import { errMsg, useAdminList, useDebounced } from '@/components/admin/common/use-admin-list'
import { CouponForm, type Coupon } from '@/components/admin/coupons/coupon-form'
import { fmtDate, label } from '@/components/admin/orders/order-types'

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'expired', label: 'Expired' },
  { value: 'inactive', label: 'Inactive' },
]
const TONE: Record<string, string> = { active: 'emerald', scheduled: 'sky', expired: 'rose', inactive: 'slate' }

function discountText(c: Coupon): string {
  if (c.discount_type === 'percentage') {
    const max = c.max_discount_minor ? ' (max ' + formatMoney(c.max_discount_minor, 'USD') + ')' : ''
    return (c.discount_value ?? 0) + '% off' + max
  }
  if (c.discount_type === 'fixed_amount') return formatMoney(c.discount_value ?? 0, 'USD') + ' off'
  return 'Free shipping'
}

export default function AdminCouponsPage() {
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const dq = useDebounced(q.trim(), 350)
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [dq])
  const { rows, meta, loading, error, reload } = useAdminList<Coupon>('/admin/coupons', {
    status,
    q: dq || undefined,
    per_page: 15,
    page,
  })
  const [form, setForm] = useState<{ coupon: Coupon | null } | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function toggle(c: Coupon) {
    setBusyId(c.id)
    setActionError(null)
    try {
      await adminFetch('/admin/coupons/' + c.id + '/active', { method: 'PATCH', body: { is_active: !c.is_active } })
      reload()
    } catch (e) {
      setActionError(errMsg(e, 'Could not update the coupon.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Coupons"
        subtitle={meta ? meta.total + (meta.total === 1 ? ' coupon' : ' coupons') : 'Loading coupons'}
        action={
          <Btn onClick={() => setForm({ coupon: null })}>
            <Plus className="h-4 w-4" />
            New coupon
          </Btn>
        }
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          tabs={TABS}
          value={status}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Search by code" />
      </div>

      {error && <ErrorNotice message={error} onRetry={reload} />}
      {actionError && <Notice message={actionError} />}

      <div className={cn(CARD, 'overflow-hidden')}>
        {loading && rows.length === 0 && <RowSkeleton />}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className={cn('w-full min-w-[760px] text-left text-sm', loading && 'opacity-60')}>
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-3 py-3 font-medium">Discount</th>
                  <th className="px-3 py-3 font-medium">Min spend</th>
                  <th className="px-3 py-3 font-medium">Used</th>
                  <th className="px-3 py-3 font-medium">Expires</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{c.code}</p>
                      {c.description && <p className="max-w-[240px] truncate text-xs text-muted-foreground">{c.description}</p>}
                    </td>
                    <td className="px-3 py-3.5">{discountText(c)}</td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      {c.min_subtotal_minor ? formatMoney(c.min_subtotal_minor, 'USD') : '-'}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      {c.used_count}
                      {c.usage_limit_total ? ' / ' + c.usage_limit_total : ''}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">{fmtDate(c.expires_at, false)}</td>
                    <td className="px-3 py-3.5">
                      <Pill tone={TONE[c.state]}>{label(c.state)}</Pill>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Btn variant="ghost" className="h-9 px-3" onClick={() => setForm({ coupon: c })}>
                          Edit
                        </Btn>
                        <Btn variant="ghost" className="h-9 px-3" busy={busyId === c.id} onClick={() => toggle(c)}>
                          {c.is_active ? 'Deactivate' : 'Activate'}
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && rows.length === 0 && <Empty title="No coupons found" text="Create a coupon or change the filter." />}
        <Pager meta={meta} loading={loading} onPage={setPage} />
      </div>

      {form && (
        <CouponForm
          key={form.coupon?.id ?? 'new'}
          coupon={form.coupon}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null)
            reload()
          }}
        />
      )}
    </div>
  )
}
