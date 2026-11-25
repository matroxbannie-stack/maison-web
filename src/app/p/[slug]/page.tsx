import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { API_BASE } from '@/lib/api'
import { ProductView } from '@/components/product/product-view'
import { ProductCard, type ProductSummary } from '@/components/product/product-card'
import type { ProductDetail } from '@/components/product/product-types'
import { Reveal } from '@/components/motion/reveal'

async function loadProduct(slug: string): Promise<ProductDetail | 'missing' | null> {
  try {
    const res = await fetch(API_BASE + '/products/' + encodeURIComponent(slug), {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    })
    if (res.status === 404) return 'missing'
    if (!res.ok) return null
    const json = (await res.json()) as { data: ProductDetail }
    return json.data
  } catch {
    return null
  }
}

async function loadRelated(categorySlug: string, excludeId: number): Promise<ProductSummary[]> {
  try {
    const res = await fetch(
      API_BASE + '/products?per_page=5&category=' + encodeURIComponent(categorySlug),
      { next: { revalidate: 60 }, headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return []
    const json = (await res.json()) as { data: ProductSummary[] }
    return json.data.filter((p) => p.id !== excludeId).slice(0, 4)
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await loadProduct(slug)
  if (!p || p === 'missing') return { title: 'Product not found' }
  const def = p.colors.find((c) => c.is_default) ?? p.colors[0]
  const image = def && def.images[0] ? def.images[0].url : undefined
  const title = p.seo_title || p.name
  const description = p.seo_description || p.short_description || undefined
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await loadProduct(slug)
  if (p === 'missing') notFound()
  if (!p) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 py-40 text-center text-muted-foreground lg:px-10">
        Product load nahi hua. Backend (php artisan serve) chal raha hai?
      </div>
    )
  }

  const def = p.colors.find((c) => c.is_default) ?? p.colors[0]
  const inStock = p.colors.some((c) => c.in_stock)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description || p.short_description || undefined,
    sku: def && def.variants[0] ? def.variants[0].sku : p.style_code,
    brand: { '@type': 'Brand', name: 'MAISON' },
    image: def ? def.images.map((i) => i.url) : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: p.price.currency,
      price: (p.price.amount_minor / 100).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  const crumb = p.breadcrumbs[p.breadcrumbs.length - 1]
  const related = crumb ? await loadRelated(crumb.slug, p.id) : []

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-28 pt-6 lg:px-10 lg:pb-24 lg:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductView product={p} />

      {related.length > 0 ? (
        <section className="mt-28 border-t border-border pt-20">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Discover more</p>
                <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight lg:text-5xl">
                  You may also like
                </h2>
              </div>
              {crumb ? (
                <Link
                  href={'/c/' + crumb.slug}
                  className="hidden text-sm underline underline-offset-4 hover:opacity-70 sm:inline"
                >
                  View all
                </Link>
              ) : null}
            </div>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {related.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.07}>
                <ProductCard product={r} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}