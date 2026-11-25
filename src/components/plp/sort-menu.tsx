'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

type Item = { value: string; label: string; href: string }

export function SortMenu({ items, current }: { items: Item[]; current: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const active = items.find((i) => i.value === current) ?? items[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 text-[13px] font-medium"
      >
        <span className="text-muted-foreground">Sort by</span>
        <span>{active.label}</span>
        <ChevronDown className={'h-4 w-4 transition-transform ' + (open ? 'rotate-180' : '')} strokeWidth={1.5} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-60 border border-border bg-background py-2 shadow-lg"
        >
          {items.map((i) => (
            <li key={i.value}>
              <Link
                href={i.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-muted"
              >
                <span className={i.value === current ? 'font-semibold' : ''}>{i.label}</span>
                {i.value === current ? <Check className="h-4 w-4" strokeWidth={1.5} /> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default SortMenu