'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react'
import { adminFetch } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'
import { CARD, ErrorNotice } from '@/components/admin/dashboard/ui'
import { Btn, Field, INPUT, Notice, PageHeader, Pill, RowSkeleton, TEXTAREA } from '@/components/admin/common/kit'
import { errMsg } from '@/components/admin/common/use-admin-list'

type Category = { id: number; parent_id: number | null; name: string }
type Color = { id: number; name: string; hex_code: string }
type Size = { id: number; type: string; label: string }
type Material = { id: number; name: string }
type Options = { categories: Category[]; colors: Color[]; sizes: Size[]; materials: Material[] }
type ProductColor = { id: number; color_id: number; name: string }
type Variant = { id: number; color: string | null; size: string | null; stock_qty: number }
type ServerImage = { id: number; url: string; product_color_id: number | null; width: number | null; height: number | null }
type Photo = { key: string; id?: number; url: string; data?: string; colorId: string; savedColorId: string }
type Detail = {
  id: number
  name: string
  slug: string
  style_code: string
  status: string
  gender: string
  product_type: string
  primary_category_id: number
  category_ids: number[]
  short_description: string | null
  description: string | null
  care_instructions: string | null
  fit_notes: string | null
  base_price_minor: number
  compare_at_price_minor: number | null
  is_featured: boolean
  is_new_arrival: boolean
  materials: { material_id: number; percentage: number }[]
}

const EMPTY = {
  name: '',
  style_code: '',
  category: '',
  gender: 'women',
  product_type: 'clothing',
  price: '',
  compare: '',
  short: '',
  description: '',
  care: '',
  fit: '',
  featured: false,
  isNew: true,
}
const SIZE_TYPES: Record<string, string[]> = {
  clothing: ['clothing', 'one_size'],
  footwear: ['shoe', 'one_size'],
  accessory: ['one_size'],
}
const toMinor = (s: string) => Math.round(Number(s) * 100)
const nothingToUpdate = (e: unknown) => e instanceof Error && e.message === 'Nothing to update.'

async function resize(file: File): Promise<string> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available.')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  return canvas.toDataURL('image/jpeg', 0.85)
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className={cn(CARD, 'space-y-4 p-5')}>
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

const chip = (on: boolean) =>
  cn(
    'inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm transition',
    on ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-muted',
  )

export function ProductForm({ productId }: { productId: number | null }) {
  const [pid, setPid] = useState<number | null>(productId)
  const [opts, setOpts] = useState<Options | null>(null)
  const [f, setF] = useState(EMPTY)
  const [mats, setMats] = useState<{ material_id: string; percentage: string }[]>([])
  const [colorIds, setColorIds] = useState<number[]>([])
  const [sizeIds, setSizeIds] = useState<number[]>([])
  const [lockedColors, setLockedColors] = useState<number[]>([])
  const [lockedSizes, setLockedSizes] = useState<number[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [stock, setStock] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<Photo[]>([])
  const [removed, setRemoved] = useState<number[]>([])
  const [drag, setDrag] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ status: string; slug: string; category: number; categoryIds: number[] } | null>(null)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setF((p) => ({ ...p, [k]: v }))

  const load = useCallback(async (id: number | null) => {
    setLoadError(null)
    try {
      const o = (await adminFetch<{ data: Options }>('/admin/product-form-options')).data
      setOpts(o)
      if (id !== null) {
        const base = '/admin/products/' + id
        const [p, c, v, i] = await Promise.all([
          adminFetch<{ data: Detail }>(base),
          adminFetch<{ data: ProductColor[] }>(base + '/colors'),
          adminFetch<{ data: { variants: Variant[] } }>(base + '/variants'),
          adminFetch<{ data: { images: ServerImage[] } }>(base + '/images'),
        ])
        const d = p.data
        setF({
          name: d.name,
          style_code: d.style_code,
          category: String(d.primary_category_id),
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
        setMeta({ status: d.status, slug: d.slug, category: d.primary_category_id, categoryIds: d.category_ids })
        setMats(d.materials.map((m) => ({ material_id: String(m.material_id), percentage: String(m.percentage) })))
        const cids = c.data.map((x) => x.color_id)
        setColorIds(cids)
        setLockedColors(cids)
        const vs = v.data.variants
        const allowed = SIZE_TYPES[d.product_type] ?? ['one_size']
        const sids = o.sizes.filter((s) => allowed.includes(s.type) && vs.some((x) => x.size === s.label)).map((s) => s.id)
        setSizeIds(sids)
        setLockedSizes(sids)
        setVariants(vs)
        setStock({})
        setRemoved([])
        setPhotos(
          i.data.images.map((img) => {
            const color = String(c.data.find((x) => x.id === img.product_color_id)?.color_id ?? '')
            return { key: 'img' + img.id, id: img.id, url: img.url, colorId: color, savedColorId: color }
          }),
        )
      }
      setReady(true)
    } catch (e) {
      setLoadError(errMsg(e, 'Could not load the product form.'))
    }
  }, [])

  useEffect(() => {
    load(productId)
  }, [load, productId])

  if (loadError) return <ErrorNotice message={loadError} onRetry={() => load(pid)} />
  if (!ready || !opts) return <RowSkeleton rows={8} />

  const sizes = opts.sizes.filter((s) => (SIZE_TYPES[f.product_type] ?? ['one_size']).includes(s.type))
  const chosenColors = opts.colors.filter((c) => colorIds.includes(c.id))
  const chosenSizes = sizes.filter((s) => sizeIds.includes(s.id))
  const findVariant = (list: Variant[], color: string, size: string) => list.find((v) => v.color === color && v.size === size)

  const categoryLabel = (c: Category): string => {
    const parent = opts.categories.find((x) => x.id === c.parent_id)
    return parent ? categoryLabel(parent) + ' / ' + c.name : c.name
  }
  const categories = opts.categories.map((c) => ({ id: c.id, label: categoryLabel(c) })).sort((a, b) => a.label.localeCompare(b.label))

  async function addFiles(files: FileList | null) {
    if (!files) return
    setError(null)
    for (const file of Array.from(files)) {
      try {
        const data = await resize(file)
        setPhotos((p) => [...p, { key: crypto.randomUUID(), url: data, data, colorId: '', savedColorId: '' }])
      } catch {
        setError('Could not read "' + file.name + '". Use a JPG, PNG or WebP photo.')
      }
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= photos.length || from === to) return
    const next = [...photos]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setPhotos(next)
  }

  function validate(publish: boolean): string | null {
    if (!f.name.trim()) return 'Name is required.'
    if (!/^[A-Za-z0-9._-]+$/.test(f.style_code.trim())) return 'Style code is required (letters, numbers, dot, dash; no spaces).'
    if (!f.category) return 'Choose a category.'
    if (!(toMinor(f.price) >= 1)) return 'Enter a valid price in USD.'
    if (f.compare.trim() && !(toMinor(f.compare) > toMinor(f.price))) return 'Compare-at price must be higher than the price.'
    if (mats.length > 0) {
      if (mats.some((m) => !m.material_id || !Number.isInteger(Number(m.percentage)) || Number(m.percentage) < 1))
        return 'Complete every material row.'
      if (new Set(mats.map((m) => m.material_id)).size !== mats.length) return 'Each material can be used once.'
      if (mats.reduce((s, m) => s + Number(m.percentage), 0) !== 100) return 'Material percentages must add up to 100.'
    }
    if (chosenSizes.length > 0 && chosenColors.length === 0) return 'Choose at least one colour.'
    if (publish && (chosenColors.length === 0 || chosenSizes.length === 0)) return 'Choose colours and sizes before publishing.'
    if (publish && photos.length === 0) return 'Add at least one photo before publishing.'
    if (Object.values(stock).some((v) => v.trim() !== '' && (!Number.isInteger(Number(v)) || Number(v) < 0)))
      return 'Stock must be a whole number (0 or more).'
    return null
  }

  async function save(publish: boolean) {
    setDone(null)
    const problem = validate(publish)
    setError(problem)
    if (problem) return
    let id = pid
    try {
      setBusy('Saving details')
      const primary = Number(f.category)
      const body: Record<string, unknown> = {
        name: f.name.trim(),
        style_code: f.style_code.trim(),
        primary_category_id: primary,
        gender: f.gender,
        product_type: f.product_type,
        base_price_minor: toMinor(f.price),
        compare_at_price_minor: f.compare.trim() ? toMinor(f.compare) : null,
        short_description: f.short.trim() || null,
        description: f.description.trim() || null,
        care_instructions: f.care.trim() || null,
        fit_notes: f.fit.trim() || null,
        is_featured: f.featured,
        is_new_arrival: f.isNew,
        materials: mats.map((m) => ({ material_id: Number(m.material_id), percentage: Number(m.percentage) })),
      }
      if (id === null) {
        const res = await adminFetch<{ data: Detail }>('/admin/products', { method: 'POST', body })
        id = res.data.id
        setPid(id)
        setMeta({ status: res.data.status, slug: res.data.slug, category: primary, categoryIds: res.data.category_ids })
        window.history.replaceState(null, '', '/admin/products/' + id)
      } else {
        if (meta && meta.category !== primary) body.category_ids = [...meta.categoryIds.filter((c) => c !== meta.category && c !== primary), primary]
        try {
          await adminFetch('/admin/products/' + id, { method: 'PATCH', body })
        } catch (e) {
          if (!nothingToUpdate(e)) throw e
        }
      }
      const base = '/admin/products/' + id

      setBusy('Saving colours')
      let colors = (await adminFetch<{ data: ProductColor[] }>(base + '/colors')).data
      for (const c of chosenColors) {
        if (!colors.some((x) => x.color_id === c.id))
          colors = (await adminFetch<{ data: ProductColor[] }>(base + '/colors', { method: 'POST', body: { color_id: c.id } })).data
      }

      setBusy('Saving sizes and stock')
      const getVariants = async () => (await adminFetch<{ data: { variants: Variant[] } }>(base + '/variants')).data.variants
      let current = await getVariants()
      const missing = chosenColors.some((c) => chosenSizes.some((s) => !findVariant(current, c.name, s.label)))
      if (missing) {
        await adminFetch(base + '/variants', { method: 'POST', body: { size_ids: chosenSizes.map((s) => s.id), initial_stock: 0 } })
        current = await getVariants()
      }
      const items: { variant_id: number; set_to: number }[] = []
      for (const c of chosenColors) {
        for (const s of chosenSizes) {
          const typed = stock[c.id + ':' + s.id]
          const v = findVariant(current, c.name, s.label)
          if (v && typed !== undefined && typed.trim() !== '' && Number(typed) !== v.stock_qty) items.push({ variant_id: v.id, set_to: Number(typed) })
        }
      }
      if (items.length > 0) await adminFetch('/admin/stock/bulk', { method: 'PATCH', body: { reason: 'restock', items } })

      for (const imageId of removed) {
        setBusy('Removing photos')
        await adminFetch('/admin/product-images/' + imageId, { method: 'DELETE' })
        setRemoved((r) => r.filter((x) => x !== imageId))
      }

      const rowId = (colorId: string) => colors.find((x) => String(x.color_id) === colorId)?.id ?? null
      const ids: number[] = []
      for (let n = 0; n < photos.length; n++) {
        const ph = photos[n]
        if (ph.id === undefined) {
          setBusy('Uploading photo ' + (n + 1) + ' of ' + photos.length)
          const up = await adminFetch<{ data: { url: string; width: number; height: number } }>('/admin/media', {
            method: 'POST',
            body: { data: ph.data, folder: 'products' },
          })
          const img = await adminFetch<{ data: ServerImage }>(base + '/images', {
            method: 'POST',
            body: { url: up.data.url, width: up.data.width, height: up.data.height, alt_text: f.name.trim(), product_color_id: rowId(ph.colorId) },
          })
          ids.push(img.data.id)
          setPhotos((list) => list.map((x) => (x.key === ph.key ? { ...x, id: img.data.id, data: undefined, savedColorId: x.colorId } : x)))
        } else {
          if (ph.colorId !== ph.savedColorId)
            await adminFetch('/admin/product-images/' + ph.id, { method: 'PATCH', body: { product_color_id: rowId(ph.colorId) } })
          ids.push(ph.id)
        }
      }
      if (ids.length > 0) await adminFetch(base + '/images/order', { method: 'PATCH', body: { ids } })

      if (publish) {
        setBusy('Publishing')
        await adminFetch(base + '/publish', { method: 'POST' })
      }
      await load(id)
      setDone(publish ? 'Product saved and published.' : 'Product saved.')
    } catch (e) {
      setError(errMsg(e, 'Could not save the product.') + (id !== null ? ' Fix the problem and save again.' : ''))
    } finally {
      setBusy(null)
    }
  }

  async function unpublish() {
    if (pid === null) return
    setError(null)
    setDone(null)
    setBusy('Unpublishing')
    try {
      await adminFetch('/admin/products/' + pid + '/unpublish', { method: 'POST' })
      setMeta((m) => (m ? { ...m, status: 'draft' } : m))
      setDone('Product is now a draft.')
    } catch (e) {
      setError(errMsg(e, 'Could not unpublish.'))
    } finally {
      setBusy(null)
    }
  }

  const live = meta?.status === 'active'

  return (
    <div className="space-y-5">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <PageHeader
        title={pid === null ? 'Add product' : f.name || 'Edit product'}
        subtitle="Details, colours, sizes and photos are saved together."
        action={
          meta && (
            <div className="flex items-center gap-3 text-sm">
              <Pill tone={live ? 'emerald' : meta.status === 'draft' ? 'amber' : 'slate'}>{meta.status}</Pill>
              {live && (
                <a href={'/p/' + meta.slug} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  View on store
                </a>
              )}
            </div>
          )
        }
      />

      <fieldset disabled={busy !== null} className="min-w-0 space-y-5">
        <Section title="Details">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input className={INPUT} value={f.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Style code" hint="Unique, for example MS-DRS-001">
              <input className={INPUT} value={f.style_code} onChange={(e) => set('style_code', e.target.value)} />
            </Field>
            <Field label="Category">
              <select className={INPUT} value={f.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Choose category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Gender">
              <select className={INPUT} value={f.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </Field>
          </div>
          <Field label="Short description">
            <input className={INPUT} maxLength={400} value={f.short} onChange={(e) => set('short', e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={TEXTAREA} rows={5} value={f.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Care instructions">
              <textarea className={TEXTAREA} rows={2} value={f.care} onChange={(e) => set('care', e.target.value)} />
            </Field>
            <Field label="Fit notes">
              <textarea className={TEXTAREA} rows={2} maxLength={300} value={f.fit} onChange={(e) => set('fit', e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Pricing and visibility">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Price (USD)">
              <input className={INPUT} inputMode="decimal" value={f.price} onChange={(e) => set('price', e.target.value)} />
            </Field>
            <Field label="Compare-at price (USD)" hint="Optional. Shows the product as on sale.">
              <input className={INPUT} inputMode="decimal" value={f.compare} onChange={(e) => set('compare', e.target.value)} />
            </Field>
          </div>
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
        </Section>

        <Section title="Materials" hint="Optional. Percentages must add up to 100.">
          {mats.map((m, i) => (
            <div key={i} className="flex gap-2">
              <select
                aria-label="Material"
                className={INPUT}
                value={m.material_id}
                onChange={(e) => setMats((l) => l.map((x, n) => (n === i ? { ...x, material_id: e.target.value } : x)))}
              >
                <option value="">Choose material</option>
                {opts.materials.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <input
                aria-label="Percentage"
                placeholder="%"
                inputMode="numeric"
                className={cn(INPUT, 'w-24')}
                value={m.percentage}
                onChange={(e) => setMats((l) => l.map((x, n) => (n === i ? { ...x, percentage: e.target.value } : x)))}
              />
              <Btn variant="ghost" aria-label="Remove material" onClick={() => setMats((l) => l.filter((_, n) => n !== i))}>
                <Trash2 className="h-4 w-4" />
              </Btn>
            </div>
          ))}
          <Btn variant="ghost" onClick={() => setMats((l) => [...l, { material_id: '', percentage: l.length === 0 ? '100' : '' }])}>
            Add material
          </Btn>
        </Section>

        <Section title="Colours, sizes and stock">
          <Field label="Product type">
            <select
              className={cn(INPUT, 'sm:w-64')}
              value={f.product_type}
              disabled={variants.length > 0}
              onChange={(e) => {
                set('product_type', e.target.value)
                setSizeIds([])
              }}
            >
              <option value="clothing">Clothing</option>
              <option value="footwear">Footwear</option>
              <option value="accessory">Accessory</option>
            </select>
          </Field>
          <Field label="Colours">
            <div className="flex flex-wrap gap-2">
              {opts.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={colorIds.includes(c.id)}
                  disabled={lockedColors.includes(c.id)}
                  className={chip(colorIds.includes(c.id))}
                  onClick={() => {
                    const on = colorIds.includes(c.id)
                    setColorIds((l) => (on ? l.filter((x) => x !== c.id) : [...l, c.id]))
                    if (on) setPhotos((l) => l.map((p) => (p.colorId === String(c.id) ? { ...p, colorId: '' } : p)))
                  }}
                >
                  <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c.hex_code }} />
                  {c.name}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Sizes">
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={sizeIds.includes(s.id)}
                  disabled={lockedSizes.includes(s.id)}
                  className={chip(sizeIds.includes(s.id))}
                  onClick={() => setSizeIds((l) => (l.includes(s.id) ? l.filter((x) => x !== s.id) : [...l, s.id]))}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>
          {chosenColors.length > 0 && chosenSizes.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Stock</th>
                    {chosenSizes.map((s) => (
                      <th key={s.id} className="px-2 py-2 font-medium">
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chosenColors.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      {chosenSizes.map((s) => {
                        const key = c.id + ':' + s.id
                        return (
                          <td key={s.id} className="px-2 py-2">
                            <input
                              inputMode="numeric"
                              aria-label={'Stock for ' + c.name + ' ' + s.label}
                              className="h-9 w-16 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-foreground/40"
                              placeholder={String(findVariant(variants, c.name, s.label)?.stock_qty ?? 0)}
                              value={stock[key] ?? ''}
                              onChange={(e) => setStock((m) => ({ ...m, [key]: e.target.value }))}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Photos" hint="The first photo is the main one. Drag or use the arrows to reorder.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {photos.map((p, i) => (
              <div
                key={p.key}
                draggable
                onDragStart={() => setDrag(p.key)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const from = photos.findIndex((x) => x.key === drag)
                  if (from >= 0) move(from, i)
                  setDrag(null)
                }}
                className="space-y-2 rounded-xl border border-border p-2"
              >
                <img src={p.url} alt="" className="aspect-[3/4] w-full cursor-move rounded-lg object-cover" />
                <select
                  aria-label="Photo colour"
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
                  value={p.colorId}
                  onChange={(e) => setPhotos((l) => l.map((x) => (x.key === p.key ? { ...x, colorId: e.target.value } : x)))}
                >
                  <option value="">All colours</option>
                  {chosenColors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex justify-between">
                  <button type="button" aria-label="Move earlier" className="rounded-lg p-1.5 hover:bg-muted" onClick={() => move(i, i - 1)}>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove photo"
                    className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-500/10"
                    onClick={() => {
                      const imageId = p.id
                      if (imageId !== undefined) setRemoved((r) => [...r, imageId])
                      setPhotos((l) => l.filter((x) => x.key !== p.key))
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Move later" className="rounded-lg p-1.5 hover:bg-muted" onClick={() => move(i, i + 1)}>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:bg-muted">
              <ImagePlus className="h-6 w-6" />
              Add photos
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  addFiles(e.target.files).then(() => {
                    e.target.value = ''
                  })
                }}
              />
            </label>
          </div>
        </Section>
      </fieldset>

      <div className={cn(CARD, 'sticky bottom-3 z-20 space-y-3 bg-background p-4')}>
        {error && <Notice message={error} />}
        {done && <Notice tone="ok" message={done} />}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {busy && <span className="mr-auto text-sm text-muted-foreground">{busy}...</span>}
          {live ? (
            <>
              <Btn variant="ghost" disabled={busy !== null} onClick={unpublish}>
                Unpublish
              </Btn>
              <Btn busy={busy !== null} onClick={() => save(false)}>
                Save changes
              </Btn>
            </>
          ) : (
            <>
              <Btn variant="ghost" disabled={busy !== null} onClick={() => save(false)}>
                Save draft
              </Btn>
              <Btn busy={busy !== null} onClick={() => save(true)}>
                Save and publish
              </Btn>
            </>
          )}
        </div>
      </div>
    </div>
  )
}