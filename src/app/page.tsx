import Link from 'next/link';
import { Suspense } from 'react';
import { Hero, type HeroSlide } from '@/components/home/hero';
import { CategoryGrid } from '@/components/home/category-grid';
import { TrendingCarousel } from '@/components/home/trending-carousel';
import { CollectionsGrid, type CmsCollection } from '@/components/home/collections-grid';
import { EditorialBanner } from '@/components/home/editorial-banner';
import { BrandStory } from '@/components/home/brand-story';
import { NewsletterSection } from '@/components/home/newsletter-section';
import { Services } from '@/components/home/services';
import type { ProductSummary } from '@/components/product/product-card';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

async function fetchCms<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

type PromoData = {
  title?: string;
  headline?: string;
  message?: string;
  subtitle?: string;
  cta_label?: string;
  cta_url?: string;
  code?: string;
};

async function HomeCmsSections() {
  const [heroSlides, trendingProducts, collections, promo] = await Promise.all([
    fetchCms<HeroSlide[]>('cms/hero-slides'),
    fetchCms<ProductSummary[]>('cms/trending'),
    fetchCms<CmsCollection[]>('cms/collections'),
    fetchCms<PromoData>('cms/promo'),
  ]);

  const promoHeading = promo?.title || promo?.headline;
  const promoText = promo?.message || promo?.subtitle;

  return (
    <>
      {promo && (promoHeading || promoText) && (
        <div className="border-b border-border bg-muted px-4 py-2.5 text-center text-xs">
          <span className="font-medium uppercase tracking-[0.12em]">
            {promoHeading}
          </span>
          {promoHeading && promoText ? ' - ' : ''}
          {promoText && <span className="text-muted-foreground">{promoText}</span>}
          {promo.code && (
            <span className="ml-2 font-mono font-semibold uppercase">
              Code: {promo.code}
            </span>
          )}
          {promo.cta_url && (
            <Link
              href={promo.cta_url}
              className="ml-3 underline underline-offset-4 font-medium"
            >
              {promo.cta_label || 'Shop now'}
            </Link>
          )}
        </div>
      )}

      <Hero slides={heroSlides} />
      <CategoryGrid />
      <TrendingCarousel products={trendingProducts} />
      <CollectionsGrid collections={collections} />
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense
        fallback={
          <>
            <Hero slides={null} />
            <CategoryGrid />
          </>
        }
      >
        <HomeCmsSections />
      </Suspense>
      <EditorialBanner />
      <BrandStory />
      <NewsletterSection />
      <Services />
    </>
  );
}