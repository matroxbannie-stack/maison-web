'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CARD, ErrorNotice } from '@/components/admin/dashboard/ui'
import { formatMoney } from '@/components/admin/dashboard/format'
import { Empty, PageHeader, Pager, Pill, RowSkeleton, SearchInput, Tabs } from '@/components/admin/common/kit'
import { useAdminList, useDebounced } from '@/components/admin/common/use-admin-list'

type Product = {
  id: number
  name: string
  slug: string
  style_code: string
  status: string
  gender: string
  product_type: string
  base_price_minor: number
  is_on_sale: boolean
  is_featured: boolean
  variants_count: number
  stock_total: number
  reserved_total: number
  available_total: number
  low_stock_variants: number
}

const TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

export default function AdminProductsPage() {
  const [status, setStatus] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [q, setQ] = useState('')
  const dq = useDebounced(q.trim(), 350)
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [dq])
  const { rows, meta, loading, error, reload } = useAdminList<Product>('/admin/products', {
    status: status || undefined,
    low_stock: lowOnly ? 1 : undefined,
    q: dq || undefined,
    per_page: 15,
    page,
  })
  const router = useRouter()

  return (
    <div className="space-y-5">
      <PageHeader title="Products" subtitle={meta ? meta.total + (meta.total === 1 ? ' product' : ' products') : 'Loading products'} action={<Link href="/admin/products/new" className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90">Add product</Link>} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            tabs={TABS}
            value={status}
            onChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={lowOnly}
              onChange={(e) => {
                setLowOnly(e.target.checked)
                setPage(1)
              }}
            />
            Low stock only
          </label>
        </div>
        <SearchInput value={q} onChange={setQ} placeholder="Name or style code" />
      </div>

      {error && <ErrorNotice message={error} onRetry={reload} />}

      <div className={cn(CARD, 'overflow-hidden')}>
        {loading && rows.length === 0 && <RowSkeleton />}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className={cn('w-full min-w-[760px] text-left text-sm', loading && 'opacity-60')}>
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Price</th>
                  <th className="px-3 py-3 text-right font-medium">Variants</th>
                  <th className="px-3 py-3 text-right font-medium">Available</th>
                  <th className="px-5 py-3 text-right font-medium">Low stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr
                    key={p.id}
                    tabIndex={0}
                    onClick={() => router.push('/admin/products/' + p.id)}
                    onKeyDown={(e) => e.key === 'Enter' && router.push('/admin/products/' + p.id)}
                    className="cursor-pointer border-b border-border outline-none transition last:border-0 hover:bg-muted/60 focus-visible:bg-muted/60"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.style_code} - {p.gender} {p.product_type}
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <Pill tone={p.status === 'active' ? 'emerald' : p.status === 'draft' ? 'amber' : 'slate'}>{p.status}</Pill>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      {formatMoney(p.base_price_minor, 'USD')}
                      {p.is_on_sale && <span className="ml-2 align-middle"><Pill tone="rose">Sale</Pill></span>}
                    </td>
                    <td className="px-3 py-3.5 text-right text-muted-foreground">{p.variants_count}</td>
                    <td className="px-3 py-3.5 text-right">
                      {p.available_total}
                      <span className="text-xs text-muted-foreground"> ({p.reserved_total} reserved)</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.low_stock_variants > 0 ? <Pill tone="amber">{p.low_stock_variants}</Pill> : <span className="text-muted-foreground">0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && rows.length === 0 && <Empty title="No products found" text="Try another filter or search." />}
        <Pager meta={meta} loading={loading} onPage={setPage} />
      </div>

    </div>
  )
}
