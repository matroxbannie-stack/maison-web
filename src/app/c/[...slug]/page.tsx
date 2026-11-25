import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { API_BASE } from '@/lib/api'
import { ProductCard, type ProductSummary } from '@/components/product/product-card'
import { SortMenu } from '@/components/plp/sort-menu'
import { FilterPanel, FilterDrawer, ActiveFilters } from '@/components/plp/filter-panel'
import { FILTER_KEYS, type FiltersData } from '@/components/plp/filter-types'
import { Reveal } from '@/components/motion/reveal'

type ListResponse = {
  data: ProductSummary[]
  meta: { current_page: number; last_page: number; total: number }
}

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_selling', label: 'Best selling' },
]

const INTRO: Record<string, string> = {
  women: 'Considered essentials in refined fabrics and clean silhouettes.',
  men: 'Tailored basics and everyday pieces, built to last.',
  kids: 'Comfortable, durable pieces for every adventure.',
  footwear: 'Leather, suede and performance footwear designed to be worn daily.',
  'new-arrivals': 'The latest pieces, just landed.',
  sale: 'Selected styles at reduced prices.',
}

async function load(params: Record<string, string>): Promise<ListResponse | null> {
  const qs = new URLSearchParams(params).toString()
  try {
    const res = await fetch(API_BASE + '/products?' + qs, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as ListResponse
  } catch {
    return null
  }
}

async function loadFilters(): Promise<FiltersData | null> {
  try {
    const res = await fetch(API_BASE + '/products/filters', {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: FiltersData }
    return json.data
  } catch {
    return null
  }
}

function titleFrom(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function clean(v: string | string[] | undefined): string {
  if (typeof v !== 'string') return ''
  if (v.length > 200) return ''
  return /^[A-Za-z0-9.,_\- ]+$/.test(v) ? v : ''
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const sp = await searchParams
  const last = slug[slug.length - 1]

  const sortRaw = typeof sp.sort === 'string' ? sp.sort : 'newest'
  const sort = SORTS.some((s) => s.value === sortRaw) ? sortRaw : 'newest'
  const pageRaw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1

  // active filters from the URL
  const keep: Record<string, string> = {}
  for (const k of FILTER_KEYS) {
    const v = clean(sp[k])
    if (v) keep[k] = v
  }
  const hasFilters = Object.keys(keep).length > 0

  const query: Record<string, string> = { ...keep, sort, page: String(page), per_page: '12' }
  if (last === 'new-arrivals') query.new = '1'
  else if (last === 'sale') query.on_sale = '1'
  else query.category = last

  const [firstResult, filters] = await Promise.all([load(query), loadFilters()])
  let result = firstResult

  // fallback: women / men / kids may be a gender filter instead of a category
  if (result && result.data.length === 0 && ['women', 'men', 'kids'].includes(last)) {
    const alt = { ...query }
    delete alt.category
    alt.gender = last
    const r2 = await load(alt)
    if (r2 && r2.data.length > 0) result = r2
  }

  const basePath = '/c/' + slug.join('/')
  const href = (s: string, p: number) => {
    const q = new URLSearchParams({ ...keep, sort: s, page: String(p) })
    return basePath + '?' + q.toString()
  }
  const sortItems = SORTS.map((s) => ({ ...s, href: href(s.value, 1) }))
  const title = titleFrom(last)
  const total = result ? result.meta.total : 0

  return (
    <div>
      {/* Page header */}
      <div className="mx-auto w-full max-w-[1600px] px-5 pb-10 pt-8 lg:px-10 lg:pb-14 lg:pt-12">
        <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{title}</span>
        </nav>
        <Reveal>
          <h1 className="mt-8 font-heading text-5xl font-semibold tracking-tight lg:text-8xl">{title}</h1>
        </Reveal>
        {INTRO[last] ? (
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">{INTRO[last]}</p>
          </Reveal>
        ) : null}
      </div>

      {/* Sticky toolbar */}
      <div className="sticky top-16 z-40 border-y border-border bg-background/90 backdrop-blur-md lg:top-[72px]">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 lg:px-10">
          <div className="flex items-center gap-5">
            {filters ? (
              <div className="lg:hidden">
                <FilterDrawer filters={filters} total={total} />
              </div>
            ) : null}
            <p className="text-[13px] text-muted-foreground">
              {result ? total + (total === 1 ? ' product' : ' products') : ''}
            </p>
          </div>
          <SortMenu items={sortItems} current={sort} />
        </div>
      </div>

      {/* Sidebar + grid */}
      <div className="mx-auto w-full max-w-[1600px] px-5 pb-24 pt-10 lg:px-10 lg:pt-12">
        <div className={filters ? 'lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14' : ''}>
          {filters ? (
            <aside className="hidden lg:block">
              <div className="sticky top-[150px] max-h-[calc(100vh-170px)] overflow-y-auto pr-2">
                <FilterPanel filters={filters} />
              </div>
            </aside>
          ) : null}

          <div>
            {filters ? <ActiveFilters filters={filters} /> : null}

            {!result ? (
              <p className="py-32 text-center text-muted-foreground">
                Products load nahi huay. Backend (php artisan serve) chal raha hai?
              </p>
            ) : result.data.length === 0 ? (
              <div className="py-32 text-center">
                <p className="font-heading text-2xl font-semibold">
                  {hasFilters ? 'No products match your filters' : 'Nothing here yet'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {hasFilters ? 'Try removing a filter or two.' : 'New pieces are on their way.'}
                </p>
                <Link
                  href={hasFilters ? basePath + '?sort=' + sort : '/'}
                  className="mt-8 inline-flex h-12 items-center bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-85"
                >
                  {hasFilters ? 'Clear all filters' : 'Back to home'}
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:gap-x-6 lg:gap-y-14 2xl:grid-cols-4">
                  {result.data.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 3) * 0.07}>
                      <ProductCard product={p} />
                    </Reveal>
                  ))}
                </div>

                {result.meta.last_page > 1 ? (
                  <div className="mt-20 flex items-center justify-center gap-6 border-t border-border pt-10">
                    {page > 1 ? (
                      <Link
                        href={href(sort, page - 1)}
                        className="inline-flex h-11 items-center gap-2 border border-border px-6 text-sm font-medium transition-colors hover:border-foreground"
                      >
                        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> Previous
                      </Link>
                    ) : null}
                    <span className="text-sm text-muted-foreground">
                      Page {result.meta.current_page} of {result.meta.last_page}
                    </span>
                    {page < result.meta.last_page ? (
                      <Link
                        href={href(sort, page + 1)}
                        className="inline-flex h-11 items-center gap-2 border border-border px-6 text-sm font-medium transition-colors hover:border-foreground"
                      >
                        Next <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}