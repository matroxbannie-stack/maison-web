'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

type Suggest = {
  products: {
    name: string;
    slug: string;
    price: { formatted: string };
    image_url: string | null;
  }[];
  categories: { name: string; slug: string }[];
};

const POPULAR = [
  { label: 'Women', href: '/c/women' },
  { label: 'Men', href: '/c/men' },
  { label: 'Footwear', href: '/c/footwear' },
  { label: 'New Arrivals', href: '/c/new-arrivals' },
  { label: 'Sale', href: '/c/sale' },
];

export function SearchOverlay() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [data, setData] = useState<Suggest | null>(null);
  const [loading, setLoading] = useState(false);

  const term = q.trim();
  const ready = term.length >= 2;

  function close() {
    setOpen(false);
    setQ('');
    setData(null);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open || term.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/search/suggest?q=${encodeURIComponent(term)}`,
          { headers: { Accept: 'application/json' }, signal: ctrl.signal },
        );
        if (!res.ok) throw new Error('bad');
        const json = await res.json();
        setData(json.data as Suggest);
      } catch {
        if (!ctrl.signal.aborted) setData(null);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [term, open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
    close();
  }

  const products = ready && data ? data.products : [];
  const categories = ready && data ? data.categories : [];
  const nothing = ready && !loading && data && products.length === 0 && categories.length === 0;

  const panel = (
    <div
      className="fixed inset-0 z-[70] bg-black/40"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="max-h-[88vh] overflow-y-auto bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-5 sm:px-6">
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-foreground pb-3">
            <Search className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search products"
              autoComplete="off"
              maxLength={100}
              className="h-10 w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </form>

          {!ready ? (
            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Popular
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      onClick={close}
                      className="inline-flex h-10 items-center border border-border px-5 text-sm transition-colors hover:bg-muted"
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {ready && loading && !data ? (
            <p className="mt-8 text-sm text-muted-foreground">Searching...</p>
          ) : null}

          {categories.length > 0 ? (
            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/search?q=${encodeURIComponent(c.name)}`}
                      onClick={close}
                      className="inline-flex h-10 items-center border border-border px-5 text-sm transition-colors hover:bg-muted"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {products.length > 0 ? (
            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Products
              </p>
              <ul className="mt-3 divide-y divide-border">
                {products.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/p/${p.slug}`}
                      onClick={close}
                      className="flex items-center gap-4 py-3 transition-opacity hover:opacity-70"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden bg-muted">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{p.price.formatted}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/search?q=${encodeURIComponent(term)}`}
                onClick={close}
                className="mt-4 inline-block text-xs font-medium uppercase tracking-wider underline underline-offset-8"
              >
                View all results
              </Link>
            </div>
          ) : null}

          {nothing ? (
            <p className="mt-8 text-sm text-muted-foreground">
              No results for &ldquo;{term}&rdquo;. Try a different word.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
      >
        <Search className="h-5 w-5" strokeWidth={1.5} />
      </button>
      {open ? createPortal(panel, document.body) : null}
    </>
  );
}

export default SearchOverlay;