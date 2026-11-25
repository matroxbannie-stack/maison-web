'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { adminFetch } from '@/lib/admin-auth'
import { cn } from '@/lib/utils'
import { label } from './order-types'

const INPUT =
  'h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10'

const COPY: Record<string, { title: string; hint: string; action: string }> = {
  processing: { title: 'Start processing', hint: 'The order moves to Processing. Stock stays reserved.', action: 'Start processing' },
  shipped: { title: 'Mark as shipped', hint: 'Stock is deducted and the customer can track this parcel.', action: 'Mark as shipped' },
  delivered: { title: 'Mark as delivered', hint: 'Cash on delivery payments are marked as paid.', action: 'Mark as delivered' },
  cancelled: { title: 'Cancel order', hint: 'Reserved stock is released and any coupon is returned. This cannot be undone.', action: 'Cancel order' },
}

export function StatusDialog({
  orderNumber,
  target,
  onClose,
  onDone,
}: {
  orderNumber: string
  target: string
  onClose: () => void
  onDone: () => void
}) {
  const copy = COPY[target] ?? { title: label(target), hint: '', action: 'Confirm' }
  const [note, setNote] = useState('')
  const [carrier, setCarrier] = useState('')
  const [tracking, setTracking] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [eta, setEta] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isShip = target === 'shipped'
  const canSubmit = !busy && (!isShip || (carrier.trim() !== '' && tracking.trim() !== ''))

  async function submit() {
    setBusy(true)
    setError(null)
    const body: Record<string, string> = { status: target }
    if (note.trim()) body.note = note.trim()
    if (isShip) {
      body.carrier = carrier.trim()
      body.tracking_number = tracking.trim()
      if (trackingUrl.trim()) body.tracking_url = trackingUrl.trim()
      if (eta) body.estimated_delivery = eta
    }
    try {
      await adminFetch('/admin/orders/' + orderNumber + '/status', { method: 'PATCH', body })
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update the order.')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={busy ? undefined : onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl"
      >
        <h3 className="text-lg font-semibold tracking-tight">{copy.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {orderNumber}. {copy.hint}
        </p>

        <div className="mt-5 space-y-3">
          {isShip && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Carrier *</label>
                <input className={INPUT} value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="TCS, Leopards, DHL..." />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tracking number *</label>
                <input className={INPUT} value={tracking} onChange={(e) => setTracking(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tracking link (optional)</label>
                <input className={INPUT} value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Estimated delivery (optional)</label>
                <input type="date" className={INPUT} value={eta} onChange={(e) => setEta(e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-11 rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium transition disabled:opacity-50',
              target === 'cancelled' ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-foreground text-background hover:opacity-90',
            )}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {copy.action}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
