export type OrderRow = {
  order_number: string
  status: string
  payment_status: string
  currency: string
  total_minor: number
  customer_name: string | null
  customer_email: string | null
  country: string | null
  item_count: number
  placed_at: string
}

export type ListResponse = {
  data: OrderRow[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export type OrderItem = {
  product_id: number | null
  variant_id: number | null
  name: string
  sku: string
  color: string | null
  size: string | null
  image_url: string | null
  unit_price_minor: number
  quantity: number
  discount_minor: number
  line_total_minor: number
}

export type OrderDetail = {
  order_number: string
  status: string
  payment_status: string
  currency: string
  exchange_rate: string
  subtotal_minor: number
  discount_minor: number
  shipping_minor: number
  tax_minor: number
  total_minor: number
  coupon_code: string | null
  delivery_method: string | null
  customer: Record<string, unknown> | null
  guest_email: string | null
  shipping_address: {
    full_name: string
    phone: string | null
    line1: string
    line2: string | null
    city: string
    state: string | null
    postal_code: string | null
    country_code: string
  }
  customer_note: string | null
  placed_at: string
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  items: OrderItem[]
  status_history: {
    from_status: string | null
    to_status: string
    note: string | null
    created_at: string
    changed_by_email: string | null
  }[]
  payments: {
    gateway: string
    status: string
    amount_minor: number
    currency_code: string
    gateway_reference: string | null
    created_at: string
  }[]
  shipments: {
    carrier: string | null
    tracking_number: string | null
    tracking_url: string | null
    estimated_delivery: string | null
    shipped_at: string | null
    delivered_at: string | null
    events: { status: string; description: string | null; location: string | null; occurred_at: string }[]
  }[]
}

export const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  processing: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  shipped: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  refunded: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
}

export const PAYMENT_STYLES: Record<string, string> = {
  unpaid: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  authorized: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  failed: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  partially_refunded: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  refunded: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
}

// Allowed next statuses (same flow as the backend).
export const NEXT_STATUSES: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
}

export function label(s: string): string {
  return s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Accepts "2026-11-25 12:03:42" or ISO strings. No timezone conversion.
export function fmtDate(value: string | null | undefined, withTime = true): string {
  if (!value) return '-'
  const [d, t] = value.replace('T', ' ').split(' ')
  const [y, m, day] = d.split('-')
  if (!y || !m || !day) return value
  const date = `${Number(day)} ${MONTHS[Number(m) - 1] ?? m} ${y}`
  return withTime && t ? `${date}, ${t.slice(0, 5)}` : date
}
