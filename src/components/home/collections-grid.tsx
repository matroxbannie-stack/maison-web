import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export type CmsCollection = {
  id: number;
  name: string;
  slug: string;
  subtitle?: string | null;
  image_url: string;
  is_featured?: boolean;
  product_count?: number;
};

export function CollectionsGrid({
  collections,
}: {
  collections?: CmsCollection[] | null;
}) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 border-t border-border">
      <Reveal>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Edits
            </p>
            <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
              Featured collections
            </h2>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {collections.map((col, idx) => (
          <Reveal key={col.id} delay={idx * 0.06}>
            <Link href={`/c/${col.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={col.image_url}
                  alt={col.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <div>
                  <h3 className="font-heading text-base font-medium tracking-tight group-hover:underline underline-offset-4">
                    {col.name}
                  </h3>
                  {col.subtitle && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {col.subtitle}
                    </p>
                  )}
                </div>
                {typeof col.product_count === 'number' && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {col.product_count} pieces
                  </span>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default CollectionsGrid;