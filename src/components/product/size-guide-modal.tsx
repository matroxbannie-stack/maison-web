'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { SizeGuide } from './product-types'

export function SizeGuideModal({ guide, onClose }: { guide: SizeGuide; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const m = guide.measurements

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={guide.name}
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto bg-background p-6 shadow-xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close size guide"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">{guide.name}</h2>
        {guide.how_to_measure ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{guide.how_to_measure}</p>
        ) : null}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4 font-medium">Size</th>
                {m.columns.map((c) => (
                  <th key={c} className="py-3 pr-4 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.rows.map((r) => (
                <tr key={r.size} className="border-b border-border">
                  <td className="py-3 pr-4 font-medium">{r.size}</td>
                  {r.values.map((v, i) => (
                    <td key={i} className="py-3 pr-4 text-muted-foreground">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SizeGuideModal