export type FiltersData = {
  price: {
    currency: string
    min: { amount_minor: number }
    max: { amount_minor: number }
  }
  colors: { name: string; slug: string; hex_code: string; product_count: number }[]
  materials: { name: string; slug: string; product_count: number }[]
  sizes: {
    clothing: { label: string }[]
    shoe: { label: string; eu: string; uk: string; us: string }[]
  }
}

export type SizeSystem = 'eu' | 'uk' | 'us'

// URL query keys that belong to filters
export const FILTER_KEYS = [
  'color',
  'material',
  'size',
  'size_system',
  'price_min',
  'price_max',
  'on_sale',
] as const