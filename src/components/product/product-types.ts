export type Money = { amount_minor: number; currency: string; formatted: string }

export type ProductImage = { url: string; alt?: string; width?: number; height?: number }

export type ProductVariant = {
  id: number
  sku: string
  size: { label: string; type: string; eu?: string; uk?: string; us?: string }
  price: Money
  in_stock: boolean
  low_stock: boolean
  max_quantity: number
}

export type ProductColor = {
  id: number
  name: string
  slug: string
  hex_code: string
  is_default: boolean
  in_stock: boolean
  images: ProductImage[]
  variants: ProductVariant[]
}

export type SizeGuide = {
  name: string
  unit?: string
  how_to_measure?: string
  measurements: {
    columns: string[]
    rows: { size: string; values: (string | number)[] }[]
  }
}

export type ProductDetail = {
  id: number
  name: string
  slug: string
  style_code: string
  short_description?: string | null
  description?: string | null
  care_instructions?: string | null
  fit_notes?: string | null
  gender?: string
  product_type?: string
  price: Money
  compare_at_price?: Money | null
  is_on_sale?: boolean
  is_new_arrival?: boolean
  rating_avg: number
  rating_count: number
  seo_title?: string | null
  seo_description?: string | null
  breadcrumbs: { name: string; slug: string }[]
  materials: { name: string; slug: string; percentage?: number }[]
  size_guide?: SizeGuide | null
  shared_images: ProductImage[]
  colors: ProductColor[]
}