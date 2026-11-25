import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

const CATEGORIES = [
  {
    name: 'Women',
    subtitle: 'Tailoring & Dresses',
    href: '/c/women',
    image: 'https://picsum.photos/seed/maison-cat-women/800/1060',
  },
  {
    name: 'Men',
    subtitle: 'Outerwear & Trousers',
    href: '/c/men',
    image: 'https://picsum.photos/seed/maison-cat-men/800/1060',
  },
  {
    name: 'Kids',
    subtitle: 'Everyday Layers',
    href: '/c/kids',
    image: 'https://picsum.photos/seed/maison-cat-kids/800/1060',
  },
  {
    name: 'Footwear',
    subtitle: 'Leather & Runners',
    href: '/c/footwear',
    image: 'https://picsum.photos/seed/maison-cat-footwear/800/1060',
  },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <Reveal>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Departments
            </p>
            <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
              Shop by category
            </h2>
          </div>
          <Link
            href="/c/new-arrivals"
            className="text-xs font-medium uppercase tracking-[0.15em] underline underline-offset-4 hover:opacity-70"
          >
            New Arrivals
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {CATEGORIES.map((cat, idx) => (
          <Reveal key={cat.href} delay={idx * 0.05}>
            <Link href={cat.href} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-heading text-lg font-medium tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80">{cat.subtitle}</p>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid;