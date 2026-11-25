'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-auth'

export type ListMeta = { current_page: number; last_page: number; per_page: number; total: number }

export function errMsg(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback
}

export function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function useAdminList<T>(path: string, params: Record<string, string | number | undefined | null>) {
  const [rows, setRows] = useState<T[]>([])
  const [meta, setMeta] = useState<ListMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const key = JSON.stringify(params)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    adminFetch<{ data: T[]; meta?: ListMeta }>(path, {
      query: JSON.parse(key) as Record<string, string | number | undefined | null>,
      signal: ctrl.signal,
    })
      .then((res) => {
        if (res) {
          setRows(res.data)
          setMeta(res.meta ?? null)
        }
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(errMsg(e, 'Could not load data.'))
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
    return () => ctrl.abort()
  }, [path, key, tick])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  return { rows, meta, loading, error, reload }
}
