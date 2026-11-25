'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { FILTER_KEYS, type FiltersData, type SizeSystem } from './filter-types'

function useFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [pending, start] = useTransition()

  const list = (key: string) => (sp.get(key) ?? '').split(',').filter(Boolean)

  function update(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(sp.toString())
    mutate(p)
    p.delete('page')
    const qs = p.toString()
    start(() => {
      router.push(qs ? pathname + '?' + qs : pathname, { scroll: false })
    })
  }

  function toggle(key: string, value: string) {
    update((p) => {
      const cur = (p.get(key) ?? '').split(',').filter(Boolean)
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
      if (next.length) p.set(key, next.join(','))
      else p.delete(key)
    })
  }

  function clearAll() {
    update((p) => {
      FILTER_KEYS.forEach((k) => p.delete(k))
    })
  }

  return { sp, list, update, toggle, clearAll, pending }
}

function activeCount(sp: URLSearchParams | { get: (k: string) => string | null }) {
  const n = (k: string) => (sp.get(k) ?? '').split(',').filter(Boolean).length
  let total = n('color') + n('material') + n('size')
  if (sp.get('price_min') || sp.get('price_max')) total += 1
  if (sp.get('on_sale') === '1') total += 1
  return total
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border py-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-[12px] font-semibold uppercase tracking-[0.18em]"
      >
        {title}
        <ChevronDown className={'h-4 w-4 transition-transform ' + (open ? 'rotate-180' : '')} strokeWidth={1.5} />
      </button>
      {open ? <div className="mt-5">{children}</div> : null}
    </div>
  )
}

export function FilterPanel({ filters }: { filters: FiltersData }) {
  const { sp, list, update, toggle, clearAll, pending } = useFilters()

  const selectedColors = list('color')
  const selectedMaterials = list('material')
  const selectedSizes = list('size')
  const system = ((sp.get('size_system') as SizeSystem) || 'eu') as SizeSystem
  const count = activeCount(sp)

  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  useEffect(() => {
    const a = sp.get('price_min')
    const b = sp.get('price_max')
    setMin(a ? String(Number(a) / 100) : '')
    setMax(b ? String(Number(b) / 100) : '')
  }, [sp])

  function applyPrice() {
    update((p) => {
      const a = parseFloat(min)
      const b = parseFloat(max)
      if (Number.isFinite(a) && a > 0) p.set('price_min', String(Math.round(a * 100)))
      else p.delete('price_min')
      if (Number.isFinite(b) && b > 0) p.set('price_max', String(Math.round(b * 100)))
      else p.delete('price_max')
    })
  }

  function changeSystem(next: SizeSystem) {
    if (next === system) return
    update((p) => {
      const cur = (p.get('size') ?? '').split(',').filter(Boolean)
      const converted = cur.map((v) => {
        const hit = filters.sizes.shoe.find((s) => s[system] === v)
        return hit ? hit[next] : v
      })
      if (converted.length) p.set('size', converted.join(','))
      else p.delete('size')
      if (next === 'eu') p.delete('size_system')
      else p.set('size_system', next)
    })
  }

  const cur = filters.price.currency
  const priceMinHint = Math.floor(filters.price.min.amount_minor / 100)
  const priceMaxHint = Math.ceil(filters.price.max.amount_minor / 100)

  return (
    <div className={pending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em]">Filters</h2>
        {count > 0 ? (
          <button type="button" onClick={clearAll} className="text-xs underline underline-offset-4 hover:opacity-70">
            Clear all ({count})
          </button>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-center gap-3 border-y border-border py-4 text-[13px] font-medium">
        <input
          type="checkbox"
          checked={sp.get('on_sale') === '1'}
          onChange={() =>
            update((p) => {
              if (p.get('on_sale') === '1') p.delete('on_sale')
              else p.set('on_sale', '1')
            })
          }
          className="h-4 w-4 accent-black dark:accent-white"
        />
        On sale only
      </label>

      <Section title="Colour">
        <div className="flex flex-wrap gap-3">
          {filters.colors.map((c) => {
            const on = selectedColors.includes(c.slug)
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle('color', c.slug)}
                aria-pressed={on}
                aria-label={c.name}
                title={c.name}
                className={
                  'h-8 w-8 rounded-full border border-border transition-all ' +
                  (on
                    ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                    : 'hover:scale-110')
                }
                style={{ backgroundColor: c.hex_code }}
              />
            )
          })}
        </div>
      </Section>

      <Section title="Size">
        <p className="mb-3 text-xs text-muted-foreground">Clothing</p>
        <div className="grid grid-cols-3 gap-2">
          {filters.sizes.clothing.map((s) => {
            const on = selectedSizes.includes(s.label)
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => toggle('size', s.label)}
                aria-pressed={on}
                className={
                  'h-10 border text-[13px] font-medium transition-colors ' +
                  (on ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground')
                }
              >
                {s.label}
              </button>
            )
          })}
        </div>

        <div className="mb-3 mt-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Footwear</p>
          <div className="flex gap-3 text-xs">
            {(['eu', 'uk', 'us'] as SizeSystem[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSystem(s)}
                className={
                  'uppercase tracking-wider ' +
                  (system === s ? 'font-semibold underline underline-offset-4' : 'text-muted-foreground hover:text-foreground')
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {filters.sizes.shoe.map((s) => {
            const value = s[system]
            const on = selectedSizes.includes(value)
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => toggle('size', value)}
                aria-pressed={on}
                className={
                  'h-10 border text-[13px] font-medium transition-colors ' +
                  (on ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground')
                }
              >
                {value}
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Material" defaultOpen={false}>
        <ul className="space-y-3">
          {filters.materials.map((m) => {
            const on = selectedMaterials.includes(m.slug)
            return (
              <li key={m.slug}>
                <button
                  type="button"
                  onClick={() => toggle('material', m.slug)}
                  aria-pressed={on}
                  className="flex w-full items-center gap-3 text-left text-[13px]"
                >
                  <span
                    className={
                      'flex h-4 w-4 items-center justify-center border ' +
                      (on ? 'border-foreground bg-foreground text-background' : 'border-border')
                    }
                  >
                    {on ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
                  </span>
                  {m.name}
                </button>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title={'Price (' + cur + ')'} defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder={String(priceMinHint)}
            aria-label="Minimum price"
            className="h-10 w-full border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground"
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder={String(priceMaxHint)}
            aria-label="Maximum price"
            className="h-10 w-full border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground"
          />
        </div>
        <button
          type="button"
          onClick={applyPrice}
          className="mt-3 h-10 w-full bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-85"
        >
          Apply
        </button>
      </Section>
    </div>
  )
}

export function FilterDrawer({ filters, total }: { filters: FiltersData; total: number }) {
  const [open, setOpen] = useState(false)
  const { sp } = useFilters()
  const count = activeCount(sp)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 text-[13px] font-medium"
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
        Filters{count > 0 ? ' (' + count + ')' : ''}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[90%] max-w-sm flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.18em]">Filter</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterPanel filters={filters} />
            </div>
            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-12 w-full bg-foreground text-sm font-medium text-background"
              >
                Show {total} {total === 1 ? 'result' : 'results'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function ActiveFilters({ filters }: { filters: FiltersData }) {
  const { sp, list, update, toggle, clearAll } = useFilters()

  const chips: { key: string; label: string; remove: () => void }[] = []

  list('color').forEach((slug) => {
    const c = filters.colors.find((x) => x.slug === slug)
    chips.push({ key: 'c-' + slug, label: c ? c.name : slug, remove: () => toggle('color', slug) })
  })
  list('material').forEach((slug) => {
    const m = filters.materials.find((x) => x.slug === slug)
    chips.push({ key: 'm-' + slug, label: m ? m.name : slug, remove: () => toggle('material', slug) })
  })
  list('size').forEach((v) => {
    chips.push({ key: 's-' + v, label: 'Size ' + v, remove: () => toggle('size', v) })
  })
  const pmin = sp.get('price_min')
  const pmax = sp.get('price_max')
  if (pmin || pmax) {
    const label =
      (pmin ? Number(pmin) / 100 : 0) + ' - ' + (pmax ? String(Number(pmax) / 100) : 'max') + ' ' + filters.price.currency
    chips.push({
      key: 'price',
      label,
      remove: () =>
        update((p) => {
          p.delete('price_min')
          p.delete('price_max')
        }),
    })
  }
  if (sp.get('on_sale') === '1') {
    chips.push({
      key: 'sale',
      label: 'On sale',
      remove: () => update((p) => p.delete('on_sale')),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.remove}
          className="inline-flex items-center gap-2 border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-foreground"
        >
          {c.label}
          <X className="h-3 w-3" strokeWidth={2} />
        </button>
      ))}
      <button type="button" onClick={clearAll} className="ml-2 text-xs underline underline-offset-4 hover:opacity-70">
        Clear all
      </button>
    </div>
  )
}