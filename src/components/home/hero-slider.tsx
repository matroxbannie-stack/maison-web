'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { HeroSlide } from '@/lib/cms';

const AUTOPLAY_MS = 6000;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const slide = slides[index];
  const light = slide.text_theme === 'light';
  const tone = light ? 'text-white' : 'text-neutral-900';

  useEffect(() => {
    if (count < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, count]);

  return (
    <section
      className="relative h-[88vh] max-h-[920px] min-h-[540px] w-full overflow-hidden bg-neutral-200"
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      {slides.map((s, i) => {
        const active = i === index;
        const sLight = s.text_theme === 'light';
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={!active}
          >
            <picture>
              {s.image.mobile ? (
                <source media="(max-width: 767px)" srcSet={s.image.mobile} />
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image.desktop}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                className={`h-full w-full object-cover transition-transform duration-[8000ms] ease-out ${active ? 'scale-105' : 'scale-100'}`}
              />
            </picture>
            <div
              className={`absolute inset-0 ${sLight ? 'bg-gradient-to-t from-black/60 via-black/10 to-black/10' : 'bg-gradient-to-t from-white/60 via-white/5 to-transparent'}`}
            />
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex max-w-[1600px] items-end justify-between gap-6 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className={`${tone} max-w-xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <h1 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                {slide.headline}
              </h1>
              {slide.subheadline ? (
                <p className="mt-4 max-w-md text-base opacity-90 sm:text-lg">
                  {slide.subheadline}
                </p>
              ) : null}
              {slide.cta ? (
                <Link
                  href={slide.cta.url}
                  className={`mt-8 inline-flex h-12 items-center px-8 text-xs font-medium uppercase tracking-wider transition-opacity hover:opacity-90 ${light ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}`}
                >
                  {slide.cta.label}
                </Link>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}