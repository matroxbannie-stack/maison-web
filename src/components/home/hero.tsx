'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type HeroSlide = {
  id: number;
  headline: string;
  subheadline?: string | null;
  cta?: {
    label: string;
    url: string;
  } | null;
  image: {
    desktop: string;
    mobile?: string | null;
  };
  text_theme?: 'light' | 'dark' | string;
};

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 0,
    headline: 'Quiet luxury, made for every day.',
    subheadline: 'Considered essentials in natural fabrics and timeless silhouettes.',
    cta: { label: 'Shop Women', url: '/c/women' },
    image: {
      desktop: 'https://picsum.photos/seed/maison-hero/1920/900',
      mobile: 'https://picsum.photos/seed/maison-hero-m/800/1100',
    },
    text_theme: 'light',
  },
];

export function Hero({ slides }: { slides?: HeroSlide[] | null }) {
  const items = slides && slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[index] ?? items[0];
  const isDarkText = current.text_theme === 'dark';

  return (
    <section
      className="relative w-full h-[78vh] min-h-[520px] max-h-[860px] overflow-hidden bg-muted"
      aria-label="Featured collections"
    >
      {items.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-all duration-1000 ease-out',
              active
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 z-0 pointer-events-none'
            )}
          >
            <img
              src={slide.image.desktop}
              alt={slide.headline}
              className="hidden md:block h-full w-full object-cover object-center"
            />
            <img
              src={slide.image.mobile || slide.image.desktop}
              alt={slide.headline}
              className="md:hidden h-full w-full object-cover object-center"
            />
            <div
              className={cn(
                'absolute inset-0',
                slide.text_theme === 'dark'
                  ? 'bg-gradient-to-t from-white/75 via-white/25 to-transparent'
                  : 'bg-gradient-to-t from-black/70 via-black/25 to-black/10'
              )}
            />
          </div>
        );
      })}

      <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div
          className={cn(
            'max-w-xl space-y-4 transition-colors duration-300',
            isDarkText ? 'text-neutral-950' : 'text-white'
          )}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-85">
            MAISON
          </p>
          <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl leading-[1.05]">
            {current.headline}
          </h1>
          {current.subheadline && (
            <p className="text-sm sm:text-base opacity-90 max-w-md leading-relaxed">
              {current.subheadline}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {current.cta?.url && (
              <Link
                href={current.cta.url}
                className={cn(
                  'inline-flex items-center justify-center px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] transition-colors',
                  isDarkText
                    ? 'bg-neutral-950 text-white hover:bg-neutral-800'
                    : 'bg-white text-neutral-950 hover:bg-neutral-200'
                )}
              >
                {current.cta.label}
              </Link>
            )}
            <Link
              href="/c/men"
              className={cn(
                'inline-flex items-center justify-center border px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] transition-colors',
                isDarkText
                  ? 'border-neutral-950/40 text-neutral-950 hover:bg-neutral-950/10'
                  : 'border-white/50 text-white hover:bg-white/15'
              )}
            >
              Shop Men
            </Link>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-5 right-4 sm:right-8 z-30 flex items-center gap-2">
          {items.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-1.5 transition-all duration-300',
                i === index
                  ? isDarkText
                    ? 'w-7 bg-neutral-950'
                    : 'w-7 bg-white'
                  : isDarkText
                  ? 'w-2.5 bg-neutral-950/35 hover:bg-neutral-950/60'
                  : 'w-2.5 bg-white/45 hover:bg-white/75'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Hero;