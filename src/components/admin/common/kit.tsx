'use client'

import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Inbox, Loader2, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const INPUT =
  'h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 disabled:opacity-60'
export const TEXTAREA =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10'

let openModals = 0

function useMounted() {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-background p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            'h-9 shrink-0 rounded-xl px-4 text-sm font-medium transition',
            value === t.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative w-full lg:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(INPUT, 'pl-9')}
      />
    </div>
  )
}

export function Pager({
  meta,
  loading,
  onPage,
}: {
  meta: { current_page: number; last_page: number } | null
  loading: boolean
  onPage: (p: number) => void
}) {
  if (!meta || meta.last_page <= 1) return null
  const btn =
    'flex h-9 w-9 items-center justify-center rounded-xl border border-border transition hover:bg-muted disabled:opacity-40'
  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3">
      <p className="text-xs text-muted-foreground">
        Page {meta.current_page} of {meta.last_page}
      </p>
      <div className="flex gap-2">
        <button type="button" className={btn} aria-label="Previous page" disabled={meta.current_page <= 1 || loading} onClick={() => onPage(meta.current_page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" className={btn} aria-label="Next page" disabled={meta.current_page >= meta.last_page || loading} onClick={() => onPage(meta.current_page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export function RowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-6 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  )
}

const TONES: Record<string, string> = {
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
}

export function Pill({ tone = 'slate', children }: { tone?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', TONES[tone] ?? TONES.slate)}>
      {children}
    </span>
  )
}

export function Btn({
  variant = 'primary',
  busy,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; busy?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      {...rest}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition disabled:opacity-50',
        variant === 'primary' && 'bg-foreground text-background hover:opacity-90',
        variant === 'ghost' && 'border border-border hover:bg-muted',
        variant === 'danger' && 'border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400',
        className,
      )}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  busy,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  busy?: boolean
}) {
  const mounted = useMounted()
  useEffect(() => {
    if (!open) return
    openModals++
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      openModals--
      document.removeEventListener('keydown', onKey)
    }
  }, [open, busy, onClose])

  if (!mounted) return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={busy ? undefined : onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-border bg-background shadow-2xl"
          >
            <h3 className="px-6 pt-6 text-lg font-semibold tracking-tight">{title}</h3>
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
            {footer && <div className="flex justify-end gap-2 px-6 pb-6 pt-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function SidePanel({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean
  title: string
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
}) {
  const mounted = useMounted()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openModals === 0) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!mounted) return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="panel"
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => openModals === 0 && onClose()} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 48, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-border bg-muted/50 shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-border bg-background px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight">{title}</p>
                {subtitle && <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{subtitle}</div>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border transition hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Notice({ message, tone = 'error' }: { message: string; tone?: 'error' | 'ok' }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl px-3 py-2 text-sm',
        tone === 'error' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      )}
    >
      {message}
    </p>
  )
}
