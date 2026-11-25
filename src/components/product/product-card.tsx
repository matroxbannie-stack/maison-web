import Link from 'next/link'

type Money = { amount_minor: number; currency: string; formatted: string }

export type ProductSummary = {
  id: number
  name: string
  slug: string
  short_description?: string | null
  price: Money
  compare_at_price?: Money | null
  is_on_sale?: boolean
  is_new_arrival?: boolean
  in_stock?: boolean
  image?: { url: string; alt?: string } | null
  colors?: { name: string; slug: string; hex_code: string }[]
}

export function ProductCard({ product }: { product: ProductSummary }) {
  const soldOut = product.in_stock === false
  const badge = soldOut ? 'Sold out' : product.is_on_sale ? 'Sale' : product.is_new_arrival ? 'New' : null
  const colorCount = product.colors?.length ?? 0

  return (
    <Link href={'/p/' + product.slug} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {product.image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image.url}
            alt={product.image.alt || product.name}
            loading="lazy"
            className={
              'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04] ' +
              (soldOut ? 'opacity-60' : '')
            }
          />
        ) : null}

        {badge ? (
          <span
            className={
              'absolute left-3 top-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ' +
              (badge === 'Sale' ? 'bg-red-600 text-white' : 'bg-background text-foreground')
            }
          >
            {badge}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-background/95 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] transition-transform duration-300 ease-out group-hover:translate-y-0">
          View product
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h3 className="text-[14px] font-medium leading-snug">{product.name}</h3>
        <div className="shrink-0 text-right text-[14px] leading-snug">
          <span className={product.compare_at_price ? 'font-medium text-red-600' : 'font-medium'}>
            {product.price.formatted}
          </span>
          {product.compare_at_price ? (
            <span className="ml-2 text-muted-foreground line-through">{product.compare_at_price.formatted}</span>
          ) : null}
        </div>
      </div>

      {colorCount > 0 ? (
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {product.colors!.slice(0, 5).map((c) => (
              <span
                key={c.slug}
                title={c.name}
                className="h-3 w-3 rounded-full ring-1 ring-border ring-offset-1 ring-offset-background"
                style={{ backgroundColor: c.hex_code }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {colorCount} {colorCount === 1 ? 'colour' : 'colours'}
          </span>
        </div>
      ) : null}
    </Link>
  )
}

export default ProductCard