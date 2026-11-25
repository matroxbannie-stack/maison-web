import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export function EditorialBanner() {
  return (
    <section className="bg-muted">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
        <Reveal>
          <div className="aspect-[4/3] overflow-hidden bg-background">
            <img
              src="https://picsum.photos/seed/maison-editorial/1200/900"
              alt="The new season essentials"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="max-w-md space-y-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              The Edit
            </p>
            <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl leading-tight">
              The new season essentials
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Architectural tailoring, breathable linen, and full-grain leather footwear designed to move effortlessly from morning to evening.
            </p>
            <div className="pt-1">
              <Link
                href="/c/new-arrivals"
                className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85"
              >
                Explore New Arrivals
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default EditorialBanner;