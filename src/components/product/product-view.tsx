'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Loader2, PackageSearch, Ruler, Truck, Wallet, X } from 'lucide-react'
import { API_BASE, getAccessToken } from '@/lib/api'
import { getCartToken } from '@/lib/cart-token'
import { useCartStore } from '@/stores/cart-store'
import type { ProductDetail } from './product-types'
import { Gallery } from './gallery'
import { SizeGuideModal } from './size-guide-modal'

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-5 text-[12px] font-semibold uppercase tracking-[0.18em]"
      >
        {title}
        <ChevronDown className={'h-4 w-4 transition-transform duration-300 ' + (open ? 'rotate-180' : '')} strokeWidth={1.5} />
      </button>
      <div
        className={
          'grid transition-[grid-template-rows] duration-300 ease-out ' + (open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')
        }
      >
        <div className="overflow-hidden">
          <div className="pb-6 text-sm leading-relaxed text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  )
}

type Toast = { image?: string; name: string; color: string; size: string; price: string; count: number | null }

export function ProductView({ product }: { product: ProductDetail }) {
  const defaultIndex = Math.max(
    0,
    product.colors.findIndex((c) => c.is_default),
  )
  const [colorIdx, setColorIdx] = useState(defaultIndex)
  const [variantId, setVariantId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [showBar, setShowBar] = useState(false)

  const btnRef = useRef<HTMLButtonElement>(null)
  const sizeRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const color = product.colors[colorIdx]
  const variants = color ? color.variants : []
  const selected = variants.find((v) => v.id === variantId) ?? null
  const images = color && color.images.length > 0 ? color.images : product.shared_images
  const price = selected ? selected.price : product.price

  const pct =
    product.compare_at_price && product.compare_at_price.amount_minor > 0
      ? Math.round((1 - product.price.amount_minor / product.compare_at_price.amount_minor) * 100)
      : 0

  useEffect(() => {
    const el = btnRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      if (addedTimer.current) clearTimeout(addedTimer.current)
    }
  }, [])

  function selectColor(i: number) {
    const prevLabel = selected ? selected.size.label : null
    const next = product.colors[i].variants.find((v) => v.size.label === prevLabel && v.in_stock)
    setColorIdx(i)
    setVariantId(next ? next.id : null)
    setErrMsg(null)
  }

  function needSize() {
    setSizeError(true)
    sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function addToBag() {
    if (!selected) {
      needSize()
      return
    }
    setAdding(true)
    setErrMsg(null)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Cart-Token': getCartToken(),
        'X-Currency': 'USD',
      }
      const token = getAccessToken()
      if (token) headers.Authorization = 'Bearer ' + token
      const res = await fetch(API_BASE + '/cart/items', {
        method: 'POST',
        headers,
        body: JSON.stringify({ variant_id: selected.id, quantity: 1 }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setErrMsg((json && json.message) || 'Could not add to bag. Please try again.')
        return
      }
      const n = json && json.data ? (json.data.item_count as number) : null
      void useCartStore.getState().refresh()
      setToast({
        image: images[0] ? images[0].url : undefined,
        name: product.name,
        color: color ? color.name : '',
        size: selected.size.label,
        price: selected.price.formatted,
        count: n,
      })
      setJustAdded(true)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      if (addedTimer.current) clearTimeout(addedTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 5000)
      addedTimer.current = setTimeout(() => setJustAdded(false), 2200)
    } catch {
      setErrMsg('Network problem. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
      <Gallery key={color ? color.slug : 'x'} images={images} name={product.name} />

      <div className="lg:sticky lg:top-[100px] lg:max-w-xl lg:self-start">
        <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Home</Link>
          {product.breadcrumbs.map((b) => (
            <span key={b.slug}>
              <span className="mx-2">/</span>
              <Link href={'/c/' + b.slug} className="hover:text-foreground">{b.name}</Link>
            </span>
          ))}
        </nav>

        <div className="mt-7 flex items-center gap-3">
          {product.is_new_arrival ? (
            <span className="bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-background">
              New
            </span>
          ) : null}
          {pct > 0 ? (
            <span className="bg-red-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
              -{pct}%
            </span>
          ) : null}
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{product.style_code}</span>
        </div>

        <h1 className="mt-4 font-heading text-4xl font-semibold leading-[1.05] tracking-tight lg:text-5xl">
          {product.name}
        </h1>

        <div className="mt-5 flex items-baseline gap-3">
          <span className={'text-2xl font-medium ' + (product.compare_at_price ? 'text-red-600' : '')}>
            {price.formatted}
          </span>
          {product.compare_at_price ? (
            <span className="text-lg text-muted-foreground line-through">{product.compare_at_price.formatted}</span>
          ) : null}
        </div>
        {product.rating_count > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {product.rating_avg.toFixed(1)} / 5 ({product.rating_count} reviews)
          </p>
        ) : null}
        {product.short_description ? (
          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{product.short_description}</p>
        ) : null}

        {/* Colour */}
        {product.colors.length > 0 ? (
          <div className="mt-9">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em]">
              Colour
              <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
                {color ? color.name : ''}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {product.colors.map((c, i) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => selectColor(i)}
                  aria-pressed={i === colorIdx}
                  aria-label={c.name}
                  title={c.name}
                  className={
                    'h-10 w-10 rounded-full border border-border transition-all duration-200 ' +
                    (i === colorIdx
                      ? 'ring-2 ring-foreground ring-offset-[3px] ring-offset-background'
                      : 'hover:scale-110')
                  }
                  style={{ backgroundColor: c.hex_code }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Size */}
        <div className="mt-9" ref={sizeRef}>
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em]">
              Size
              {sizeError && !selected ? (
                <span className="ml-3 font-normal normal-case tracking-normal text-red-600">Please select a size</span>
              ) : null}
            </p>
            {product.size_guide ? (
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs underline underline-offset-4 hover:opacity-70"
              >
                <Ruler className="h-3.5 w-3.5" strokeWidth={1.5} /> Size guide
              </button>
            ) : null}
          </div>
          <div
            className={
              'mt-4 grid grid-cols-4 gap-2 transition-all sm:grid-cols-5 ' +
              (sizeError && !selected ? 'ring-1 ring-red-600 ring-offset-8 ring-offset-background' : '')
            }
          >
            {variants.map((v) => {
              const on = v.id === variantId
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!v.in_stock}
                  onClick={() => {
                    setVariantId(v.id)
                    setSizeError(false)
                    setErrMsg(null)
                  }}
                  aria-pressed={on}
                  className={
                    'h-12 border text-sm font-medium transition-colors duration-200 ' +
                    (!v.in_stock
                      ? 'cursor-not-allowed border-border text-muted-foreground/50 line-through'
                      : on
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground')
                  }
                >
                  {v.size.label}
                </button>
              )
            })}
          </div>
          {selected && selected.low_stock ? (
            <p className="mt-3 text-xs font-medium text-red-600">Only {selected.max_quantity} left in stock</p>
          ) : null}
        </div>

        {/* Add to bag */}
        <button
          ref={btnRef}
          type="button"
          onClick={addToBag}
          disabled={adding}
          className={
            'mt-9 inline-flex h-14 w-full items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-300 disabled:opacity-70 ' +
            (justAdded ? 'bg-emerald-700 text-white' : 'bg-foreground text-background hover:opacity-85')
          }
        >
          {adding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Adding
            </>
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.5} /> Added to bag
            </>
          ) : (
            'Add to bag'
          )}
        </button>
        {errMsg ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {errMsg}
          </p>
        ) : null}

        {/* Trust row */}
        <div className="mt-8 grid grid-cols-3 gap-3 border-y border-border py-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Truck className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-[11px] leading-snug text-muted-foreground">Free delivery over $100</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Wallet className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-[11px] leading-snug text-muted-foreground">Cash on delivery</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PackageSearch className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-[11px] leading-snug text-muted-foreground">Track your order</span>
          </div>
        </div>

        {/* Details */}
        <div className="mt-2">
          {product.description ? (
            <Accordion title="Description" defaultOpen>
              {product.description}
            </Accordion>
          ) : null}
          {product.materials.length > 0 || product.care_instructions ? (
            <Accordion title="Materials & care">
              {product.materials.length > 0 ? (
                <p className="mb-3">
                  {product.materials
                    .map((m) => (m.percentage ? m.percentage + '% ' + m.name : m.name))
                    .join(', ')}
                </p>
              ) : null}
              {product.care_instructions ? <p>{product.care_instructions}</p> : null}
            </Accordion>
          ) : null}
          {product.fit_notes ? <Accordion title="Fit">{product.fit_notes}</Accordion> : null}
          <Accordion title="Delivery">
            Free standard delivery on orders over $100. Cash on delivery is available.
          </Accordion>
        </div>
      </div>

      {guideOpen && product.size_guide ? (
        <SizeGuideModal guide={product.size_guide} onClose={() => setGuideOpen(false)} />
      ) : null}

      {/* Added-to-bag notification */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            className="fixed right-4 top-24 z-[75] w-[calc(100%-2rem)] max-w-sm border border-border bg-background p-4 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em]">
                <Check className="h-4 w-4" strokeWidth={2.5} /> Added to bag
              </p>
              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Dismiss"
                className="-mr-1 -mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="mt-4 flex gap-4">
              {toast.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={toast.image} alt="" className="h-24 w-[76px] shrink-0 object-cover" />
              ) : null}
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium">{toast.name}</p>
                <p className="mt-1 text-muted-foreground">
                  {toast.color} / Size {toast.size}
                </p>
                <p className="mt-1 font-medium">{toast.price}</p>
                {toast.count ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {toast.count} {toast.count === 1 ? 'item' : 'items'} in your bag
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Sticky add-to-bag bar (mobile) */}
      <AnimatePresence>
        {showBar ? (
          <motion.div
            key="bar"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">{price.formatted}</p>
            </div>
            <button
              type="button"
              onClick={selected ? addToBag : needSize}
              disabled={adding}
              className="h-12 shrink-0 bg-foreground px-7 text-xs font-semibold uppercase tracking-[0.15em] text-background disabled:opacity-70"
            >
              {selected ? 'Add to bag' : 'Select size'}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default ProductView