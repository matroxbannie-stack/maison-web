import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { API_BASE } from '@/lib/api';
import { ProductCard, type ProductSummary } from '@/components/product/product-card';

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false },
};

type Result = {
  data: ProductSummary[];
  meta: { current_page: number; last_page: number; total: number };
};

async function load(q: string, page: number): Promise<Result | null> {
  try {
    const res = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(q)}&page=${page}`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' },
    );
    if (!res.ok) return null;
    return (await res.json()) as Result;
  } catch {
    return null;
  }
}

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (typeof sp.q === 'string' ? sp.q : '').trim().slice(0, 100);
  const page = Math.max(1, parseInt(typeof sp.page === 'string' ? sp.page : '1', 10) || 1);
  const result = q.length >= 2 ? await load(q, page) : null;
  const items = result?.data ?? [];
  const meta = result?.meta;
  const href = (n: number) => `/search?q=${encodeURIComponent(q)}&page=${n}`;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {q ? `Results for \u201C${q}\u201D` : 'Search'}
      </h1>

      <form action="/search" method="get" className="mt-6 flex max-w-xl border-b border-foreground">
        <input
          name="q"
          defaultValue={q}
          type="search"
          placeholder="Search products"
          autoComplete="off"
          maxLength={100}
          className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <button type="submit" className="px-2 text-xs font-medium uppercase tracking-wider">
          Search
        </button>
      </form>

      {q.length < 2 ? (
        <p className="mt-10 text-muted-foreground">Type at least 2 letters to search.</p>
      ) : !result ? (
        <p className="mt-10 text-muted-foreground">
          Search is not available right now. Please try again in a moment.
        </p>
      ) : items.length === 0 ? (
        <div className="mt-10">
          <p className="text-muted-foreground">No products found. Try a different word.</p>
          <Link
            href="/c/new-arrivals"
            className="mt-6 inline-flex h-12 items-center bg-foreground px-8 text-xs font-medium uppercase tracking-wider text-background transition-opacity hover:opacity-90"
          >
            Shop new arrivals
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted-foreground">
            {meta?.total ?? items.length} {(meta?.total ?? items.length) === 1 ? 'product' : 'products'}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {meta && meta.last_page > 1 ? (
            <nav className="mt-14 flex items-center justify-center gap-6 text-xs font-medium uppercase tracking-wider" aria-label="Pagination">
              {meta.current_page > 1 ? (
                <Link href={href(meta.current_page - 1)} className="underline underline-offset-8">
                  Previous
                </Link>
              ) : null}
              <span className="text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </span>
              {meta.current_page < meta.last_page ? (
                <Link href={href(meta.current_page + 1)} className="underline underline-offset-8">
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 text-sm text-muted-foreground">Loading search...</div>}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}