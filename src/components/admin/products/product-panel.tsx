'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'
import { CARD, ErrorNotice } from '@/components/admin/dashboard/ui'
import { Btn, Field, INPUT, Notice, Pill, RowSkeleton, SidePanel, TEXTAREA, Tabs } from '@/components/admin/common/kit'
import { errMsg } from '@/components/admin/common/use-admin-list'

type Variant = {
  id: number
  sku: string
  color: string | null
  size: string | null
  stock_qty: number
  reserved_qty: number
  available_qty: number
  low_stock_threshold: number
  is_low_stock: boolean
  is_active: boolean
}

type Detail = {
  id: number
  name: string
  slug: string
  style_code: string
  status: string
  gender: string
  product_type: string
  short_description: string | null
  description: string | null
  care_instructions: string | null
  fit_notes: string | null
  base_price_minor: number
  compare_at_price_minor: number | null
  is_featured: boolean
  is_new_arrival: boolean
}

type Form = {
  name: string
  style_code: string
  gender: string
  product_type: string
  price: string
  compare: string
  short: string
  description: string
  care: string
  fit: string
  featured: boolean
  isNew: boolean
}

const toForm = (d: Detail): Form => ({
  name: d.name,
  style_code: d.style_code,
  gender: d.gender,
  product_type: d.product_type,
  price: (d.base_price_minor / 100).toFixed(2),
  compare: d.compare_at_price_minor ? (d.compare_at_price_minor / 100).toFixed(2) : '',
  short: d.short_description ?? '',
  description: d.description ?? '',
  care: d.care_instructions ?? '',
  fit: d.fit_notes ?? '',
  featured: d.is_featured,
  isNew: d.is_new_arrival,
})
const toMinor = (s: string) => Math.round(Number(s) * 100)

function StockTab({ id, onChanged }: { id: number; onChanged: () => void }) {
  const [variants, setVariants] = useState<Variant[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [edits, setEdits] = useState<Record<number, string>>({})
  const [reason, setReason] = useState('adjustment')
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    setError(null)
    adminFetch<{ data: { variants: Variant[] } }>('/admin/products/' + id + '/variants', { signal: ctrl.signal })
      .then((res) => res && setVariants(res.data.variants))
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(errMsg(e, 'Could not load variants.'))
      })
    return () => ctrl.abort()
  }, [id, tick])

  const changed = (variants ?? []).filter((v) => {
    const e = edits[v.id]
    return e !== undefined && e.trim() !== '' && Number(e) !== v.stock_qty
  })
  const invalid = changed.some((v) => {
    const n = Number(edits[v.id])
    return !Number.isInteger(n) || n < 0
  })

  async function save() {
    setBusy(true)
    setSaveError(null)
    setSaved(null)
    try {
      await adminFetch('/admin/stock/bulk', {
        method: 'PATCH',
        body: { reason, items: changed.map((v) => ({ variant_id: v.id, set_to: Number(edits[v.id]) })) },
      })
      setEdits({})
      setSaved('Stock updated for ' + changed.length + (changed.length === 1 ? ' variant.' : ' variants.'))
      setTick((n) => n + 1)
      onChanged()
    } catch (e) {
      setSaveError(errMsg(e, 'Could not update stock.'))
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorNotice message={error} onRetry={() => setTick((n) => n + 1)} />
  if (!variants) return <RowSkeleton rows={6} />

  return (
    <div className="space-y-3">
      <div className={cn(CARD, 'overflow-hidden')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Variant</th>
                <th className="px-2 py-3 text-right font-medium">Stock</th>
                <th className="px-2 py-3 text-right font-medium">Reserved</th>
                <th className="px-2 py-3 text-right font-medium">Available</th>
                <th className="px-4 py-3 text-right font-medium">Set stock to</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">
                    <p className="font-medium">
                      {[v.color, v.size && 'Size ' + v.size].filter(Boolean).join(', ')}
                      {v.is_low_stock && <span className="ml-2 align-middle"><Pill tone="amber">Low</Pill></span>}
                      {!v.is_active && <span className="ml-2 align-middle"><Pill>Inactive</Pill></span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{v.sku}</p>
                  </td>
                  <td className="px-2 py-2.5 text-right">{v.stock_qty}</td>
                  <td className="px-2 py-2.5 text-right text-muted-foreground">{v.reserved_qty}</td>
                  <td className="px-2 py-2.5 text-right">{v.available_qty}</td>
                  <td className="px-4 py-2.5 text-right">
                    <input
                      inputMode="numeric"
                      aria-label={'New stock for ' + v.sku}
                      value={edits[v.id] ?? ''}
                      placeholder={String(v.stock_qty)}
                      onChange={(e) => setEdits((m) => ({ ...m, [v.id]: e.target.value }))}
                      className="h-9 w-20 rounded-lg border border-border bg-background px-2 text-right text-sm outline-none focus:border-foreground/40"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Stock cannot be set below the reserved quantity.</p>
      {saved && <Notice tone="ok" message={saved} />}
      {saveError && <Notice message={saveError} />}
      <div className="flex flex-wrap items-center gap-3">
        <select className={cn(INPUT, 'w-auto')} value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason">
          <option value="adjustment">Reason: adjustment</option>
          <option value="restock">Reason: restock</option>
        </select>
        <Btn busy={busy} disabled={changed.length === 0 || invalid} onClick={save}>
          {changed.length > 0 ? 'Save ' + changed.length + (changed.length === 1 ? ' change' : ' changes') : 'Save changes'}
        </Btn>
      </div>
    </div>
  )
}

function DetailsTab({ id, onChanged }: { id: number; onChanged: () => void }) {
  const [orig, setOrig] = useState<Form | null>(null)
  const [f, setF] = useState<Form | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    setError(null)
    adminFetch<{ data: Detail }>('/admin/products/' + id, { signal: ctrl.signal })
      .then((res) => {
        if (res) {
          const form = toForm(res.data)
          setOrig(form)
          setF(form)
        }
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(errMsg(e, 'Could not load the product.'))
      })
    return () => ctrl.abort()
  }, [id, tick])

  const set = useCallback(<K extends keyof Form>(k: K, v: Form[K]) => setF((p) => (p ? { ...p, [k]: v } : p)), [])

  if (error) return <ErrorNotice message={error} onRetry={() => setTick((n) => n + 1)} />
  if (!f || !orig) return <RowSkeleton rows={6} />

  async function save() {
    if (!f || !orig) return
    setSaveError(null)
    setSaved(false)
    const body: Record<string, unknown> = {}
    if (f.name !== orig.name) {
      if (!f.name.trim()) return setSaveError('Name is required.')
      body.name = f.name.trim()
    }
    if (f.style_code !== orig.style_code) {
      if (!f.style_code.trim()) return setSaveError('Style code is required.')
      body.style_code = f.style_code.trim()
    }
    if (f.gender !== orig.gender) body.gender = f.gender
    if (f.product_type !== orig.product_type) body.product_type = f.product_type
    if (f.price !== orig.price) {
      const n = toMinor(f.price)
      if (!Number.isFinite(n) || n < 1) return setSaveError('Enter a valid price in USD.')
      body.base_price_minor = n
    }
    if (f.compare !== orig.compare) {
      const n = toMinor(f.compare)
      if (f.compare.trim() !== '' && (!Number.isFinite(n) || n < 1)) return setSaveError('Enter a valid compare-at price.')
      body.compare_at_price_minor = f.compare.trim() === '' ? null : n
    }
    if (f.short !== orig.short) body.short_description = f.short.trim() || null
    if (f.description !== orig.description) body.description = f.description.trim() || null
    if (f.care !== orig.care) body.care_instructions = f.care.trim() || null
    if (f.fit !== orig.fit) body.fit_notes = f.fit.trim() || null
    if (f.featured !== orig.featured) body.is_featured = f.featured
    if (f.isNew !== orig.isNew) body.is_new_arrival = f.isNew
    if (Object.keys(body).length === 0) return setSaveError('Nothing to save yet.')
    setBusy(true)
    try {
      await adminFetch('/admin/products/' + id, { method: 'PATCH', body })
      setOrig(f)
      setSaved(true)
      onChanged()
    } catch (e) {
      setSaveError(errMsg(e, 'Could not save the product.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cn(CARD, 'space-y-3 p-5')}>
      <Field label="Name">
        <input className={INPUT} value={f.name} onChange={(e) => set('name', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Style code">
          <input className={INPUT} value={f.style_code} onChange={(e) => set('style_code', e.target.value)} />
        </Field>
        <Field label="Gender">
          <select className={INPUT} value={f.gender} onChange={(e) => set('gender', e.target.value)}>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
            <option value="unisex">Unisex</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Type">
          <select className={INPUT} value={f.product_type} onChange={(e) => set('product_type', e.target.value)}>
            <option value="clothing">Clothing</option>
            <option value="footwear">Footwear</option>
            <option value="accessory">Accessory</option>
          </select>
        </Field>
        <Field label="Price (USD)">
          <input className={INPUT} inputMode="decimal" value={f.price} onChange={(e) => set('price', e.target.value)} />
        </Field>
        <Field label="Compare at (USD)">
          <input className={INPUT} inputMode="decimal" value={f.compare} onChange={(e) => set('compare', e.target.value)} />
        </Field>
      </div>
      <Field label="Short description">
        <input className={INPUT} value={f.short} onChange={(e) => set('short', e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea className={TEXTAREA} rows={4} value={f.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <Field label="Care instructions">
        <textarea className={TEXTAREA} rows={2} value={f.care} onChange={(e) => set('care', e.target.value)} />
      </Field>
      <Field label="Fit notes">
        <input className={INPUT} value={f.fit} onChange={(e) => set('fit', e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" checked={f.isNew} onChange={(e) => set('isNew', e.target.checked)} />
          New arrival
        </label>
      </div>
      {saved && <Notice tone="ok" message="Product saved." />}
      {saveError && <Notice message={saveError} />}
      <Btn busy={busy} onClick={save}>
        Save changes
      </Btn>
    </div>
  )
}

export function ProductPanel({
  id,
  name,
  status,
  slug,
  onClose,
  onChanged,
}: {
  id: number
  name: string
  status: string
  slug: string
  onClose: () => void
  onChanged: () => void
}) {
  const [tab, setTab] = useState('stock')
  return (
    <SidePanel
      open
      title={name}
      onClose={onClose}
      subtitle={
        <>
          <Pill tone={status === 'active' ? 'emerald' : status === 'draft' ? 'amber' : 'slate'}>{status}</Pill>
          <a href={'/p/' + slug} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            View on store
          </a>
        </>
      }
    >
      <Tabs
        tabs={[
          { value: 'stock', label: 'Stock' },
          { value: 'details', label: 'Details' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'stock' ? <StockTab id={id} onChanged={onChanged} /> : <DetailsTab id={id} onChanged={onChanged} />}
    </SidePanel>
  )
}
