'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard, type ProductSummary } from '@/components/product/product-card';

export function TrendingCarousel({
  products,
}: {
  products?: ProductSummary[] | null;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scrollByAmount = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.75, 300);
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 border-t border-border">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Curated Selection
          </p>
          <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
            Trending now
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/c/new-arrivals"
            className="hidden sm:inline-block text-xs font-medium uppercase tracking-[0.15em] underline underline-offset-4 hover:opacity-70"
          >
            View all
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              aria-label="Scroll trending left"
              className="flex h-9 w-9 items-center justify-center border border-border bg-background text-foreground transition hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              aria-label="Scroll trending right"
              className="flex h-9 w-9 items-center justify-center border border-border bg-background text-foreground transition hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:gap-6"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[68%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[23.5%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrendingCarousel;