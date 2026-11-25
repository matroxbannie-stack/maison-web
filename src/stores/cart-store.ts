import { create } from 'zustand'
import { API_BASE, getAccessToken } from '@/lib/api'
import { getCartToken } from '@/lib/cart-token'

export type Money = { amount_minor: number; currency: string; formatted: string }

export type CartLine = {
  id: number
  variant_id: number
  sku: string
  quantity: number
  product: { name: string; slug: string }
  color: unknown
  size: unknown
  image_url: string | null
  unit_price: Money
  line_total: Money
  max_quantity: number
  issue: unknown
}

export type Cart = {
  currency: string
  items: CartLine[]
  item_count: number
  subtotal: Money
  coupon: unknown
  discount: Money | null
  free_shipping: boolean
  total: Money
  has_issues: boolean
  checkout_ready: boolean
}

async function call(path: string, method: string = 'GET', body?: unknown) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Currency': 'USD',
    'X-Cart-Token': getCartToken(),
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getAccessToken()
  if (token) headers.Authorization = 'Bearer ' + token
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error((json && json.message) || 'Something went wrong. Please try again.')
  }
  return json
}

type CartState = {
  cart: Cart | null
  open: boolean
  loading: boolean
  busyId: number | null
  couponBusy: boolean
  error: string | null
  openDrawer: () => void
  closeDrawer: () => void
  refresh: () => Promise<void>
  setQty: (id: number, qty: number) => Promise<void>
  remove: (id: number) => Promise<void>
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => Promise<void>
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  open: false,
  loading: false,
  busyId: null,
  couponBusy: false,
  error: null,

  openDrawer: () => {
    set({ open: true, error: null })
    void get().refresh()
  },
  closeDrawer: () => set({ open: false }),

  refresh: async () => {
    set({ loading: true })
    try {
      const json = await call('/cart')
      set({ cart: (json && json.data) as Cart, error: null })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not load your bag.' })
    } finally {
      set({ loading: false })
    }
  },

  setQty: async (id, qty) => {
    if (qty < 1) {
      await get().remove(id)
      return
    }
    set({ busyId: id, error: null })
    try {
      await call('/cart/items/' + id, 'PATCH', { quantity: qty })
      await get().refresh()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not update quantity.' })
    } finally {
      set({ busyId: null })
    }
  },

  remove: async (id) => {
    set({ busyId: id, error: null })
    try {
      await call('/cart/items/' + id, 'DELETE')
      await get().refresh()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not remove item.' })
    } finally {
      set({ busyId: null })
    }
  },

  applyCoupon: async (code) => {
    set({ couponBusy: true, error: null })
    try {
      await call('/cart/coupon', 'POST', { code })
      await get().refresh()
      return true
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not apply code.' })
      return false
    } finally {
      set({ couponBusy: false })
    }
  },

  removeCoupon: async () => {
    set({ couponBusy: true, error: null })
    try {
      await call('/cart/coupon', 'DELETE')
      await get().refresh()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not remove code.' })
    } finally {
      set({ couponBusy: false })
    }
  },
}))