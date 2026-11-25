import Link from "next/link";
import type { ReactNode } from "react";

export type Section = { heading: string; body: string[] };

export function StaticPage({
  title,
  intro,
  sections,
  children,
}: {
  title: string;
  intro?: string;
  sections?: Section[];
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      <nav className="mb-10 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h1>
      {intro ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          {intro}
        </p>
      ) : null}

      <div className="mt-12 space-y-10">
        {sections?.map((s) => (
          <section key={s.heading}>
            <h2 className="font-heading text-lg font-semibold">{s.heading}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
        {children}
      </div>
    </div>
  );
}