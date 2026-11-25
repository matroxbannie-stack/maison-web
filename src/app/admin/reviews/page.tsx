'use client'

import { useEffect, useState } from 'react'
import { Check, Star, X } from 'lucide-react'
import { adminFetch } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'
import { CARD, ErrorNotice } from '@/components/admin/dashboard/ui'
import { Btn, Empty, Notice, PageHeader, Pager, Pill, RowSkeleton, SearchInput, Tabs } from '@/components/admin/common/kit'
import { errMsg, useAdminList, useDebounced } from '@/components/admin/common/use-admin-list'
import { fmtDate, label } from '@/components/admin/orders/order-types'

type Review = {
  id: number
  product: { id: number; name: string; slug: string } | null
  customer: { id: number; name: string; email: string } | null
  rating: number
  title: string | null
  body: string | null
  fit_feedback: string | null
  is_verified_purchase: boolean
  status: string
  helpful_count: number
  created_at: string
}

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]
const TONE: Record<string, string> = { pending: 'amber', approved: 'emerald', rejected: 'rose' }

export default function AdminReviewsPage() {
  const [status, setStatus] = useState('pending')
  const [q, setQ] = useState('')
  const dq = useDebounced(q.trim(), 350)
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [dq])
  const { rows, meta, loading, error, reload } = useAdminList<Review>('/admin/reviews', {
    status,
    q: dq || undefined,
    per_page: 12,
    page,
  })
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function moderate(id: number, to: 'approved' | 'rejected') {
    setBusyId(id)
    setActionError(null)
    try {
      await adminFetch('/admin/reviews/' + id + '/status', { method: 'PATCH', body: { status: to } })
      reload()
    } catch (e) {
      setActionError(errMsg(e, 'Could not update the review.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Reviews" subtitle={meta ? meta.total + (meta.total === 1 ? ' review' : ' reviews') : 'Loading reviews'} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          tabs={TABS}
          value={status}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Search reviews" />
      </div>

      {error && <ErrorNotice message={error} onRetry={reload} />}
      {actionError && <Notice message={actionError} />}

      <div className={cn(CARD, 'overflow-hidden')}>
        {loading && rows.length === 0 && <RowSkeleton />}
        {!loading && !error && rows.length === 0 && (
          <Empty title={'No ' + status + ' reviews'} text="Reviews from customers will show up here." />
        )}
        <ul className={cn('divide-y divide-border', loading && rows.length > 0 && 'opacity-60')}>
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex" aria-label={r.rating + ' out of 5'}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={cn('h-4 w-4', n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-border')} />
                    ))}
                  </span>
                  <Pill tone={TONE[r.status]}>{label(r.status)}</Pill>
                  {r.is_verified_purchase && <Pill tone="sky">Verified purchase</Pill>}
                  {r.fit_feedback && <Pill>{label(r.fit_feedback)}</Pill>}
                </div>
                {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
                {r.body && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.product?.name ?? 'Deleted product'} by {r.customer?.name ?? 'Unknown'}
                  {r.customer?.email ? ' (' + r.customer.email + ')' : ''}, {fmtDate(r.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {r.status !== 'approved' && (
                  <Btn className="h-10" busy={busyId === r.id} onClick={() => moderate(r.id, 'approved')}>
                    <Check className="h-4 w-4" />
                    Approve
                  </Btn>
                )}
                {r.status !== 'rejected' && (
                  <Btn variant="danger" className="h-10" disabled={busyId === r.id} onClick={() => moderate(r.id, 'rejected')}>
                    <X className="h-4 w-4" />
                    Reject
                  </Btn>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Pager meta={meta} loading={loading} onPage={setPage} />
      </div>
    </div>
  )
}
