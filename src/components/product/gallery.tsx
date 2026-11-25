'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import type { ProductImage } from './product-types'

const pad = (n: number) => String(n).padStart(2, '0')

export function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const n = images.length
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [light, setLight] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!light || n === 0) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLight(false)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + n) % n)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % n)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [light, n])

  if (n === 0) return <div className="aspect-[4/5] bg-muted" />

  const go = (d: number) => setIndex((i) => (i + d + n) % n)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    })
  }

  function onScroll() {
    const el = scroller.current
    if (!el || el.clientWidth === 0) return
    setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      {/* Thumbnails (desktop) */}
      {n > 1 ? (
        <div className="hidden lg:order-first lg:flex lg:w-20 lg:flex-col lg:gap-3">
          {images.map((im, i) => (
            <button
              key={im.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={'Show image ' + (i + 1)}
              aria-current={i === index}
              className={
                'aspect-[4/5] w-20 overflow-hidden border bg-muted transition-all duration-300 ' +
                (i === index ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100')
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Mobile: swipe carousel */}
      <div className="relative lg:hidden">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((im, i) => (
            <div key={im.url} className="aspect-[4/5] w-full shrink-0 snap-center bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={im.url}
                alt={im.alt || name}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        {n > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {images.map((im, i) => (
              <span
                key={im.url}
                className={
                  'h-1.5 rounded-full transition-all duration-300 ' +
                  (i === index ? 'w-5 bg-foreground' : 'w-1.5 bg-foreground/35')
                }
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop: main image */}
      <div
        className="group relative hidden aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden bg-muted lg:block"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        onClick={() => setLight(true)}
      >
        {images.map((im, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={im.url}
            src={im.url}
            alt={im.alt || name}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ' +
              (i === index ? 'opacity-100' : 'pointer-events-none opacity-0')
            }
            style={
              i === index
                ? {
                    transform: zoom ? 'scale(1.8)' : 'scale(1)',
                    transformOrigin: pos.x + '% ' + pos.y + '%',
                    transition: 'transform 200ms ease-out, opacity 500ms ease-out',
                  }
                : undefined
            }
          />
        ))}

        <span className="absolute bottom-5 left-5 bg-background/90 px-2.5 py-1 text-[11px] font-medium tracking-[0.15em]">
          {pad(index + 1)} / {pad(n)}
        </span>
        <span className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" strokeWidth={1.5} />
        </span>

        {n > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation()
                go(-1)
              }}
              className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 opacity-0 transition-opacity duration-300 hover:bg-background group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation()
                go(1)
              }}
              className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 opacity-0 transition-opacity duration-300 hover:bg-background group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </>
        ) : null}
      </div>

      {/* Lightbox */}
      {light ? (
        <div className="fixed inset-0 z-[90] bg-background">
          <div className="absolute left-5 top-5 text-sm font-medium tracking-[0.15em]">
            {pad(index + 1)} / {pad(n)}
          </div>
          <button
            type="button"
            onClick={() => setLight(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index].url}
            alt={images[index].alt || name}
            className="h-full w-full object-contain p-4 sm:p-12"
          />
          {n > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => go(-1)}
                className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full hover:bg-muted"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => go(1)}
                className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full hover:bg-muted"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default Gallery