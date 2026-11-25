import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export function BrandStory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center space-y-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Our Philosophy
          </p>
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            Fewer pieces, better made.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every MAISON garment and pair of shoes is developed around enduring proportions, honest natural materials, and thoughtful construction meant to outlast passing trends.
          </p>
          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center justify-center border border-border px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:bg-muted"
            >
              Read Our Story
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default BrandStory;