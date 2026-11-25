'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function ScrollRow({
  eyebrow,
  title,
  href,
  children,
}: {
  eyebrow: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);

  const scroll = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="font-heading mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={href}
            className="text-sm font-medium underline underline-offset-4"
          >
            View all
          </Link>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:bg-muted"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <ul
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0"
      >
        {children}
      </ul>
    </section>
  );
}
