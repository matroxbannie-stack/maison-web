const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

export type HeroSlide = {
  id: number;
  headline: string;
  subheadline: string | null;
  cta: { label: string; url: string } | null;
  image: { desktop: string; mobile: string | null };
  text_theme: 'light' | 'dark';
};

// Server-side fetch for public CMS endpoints. Returns null on any failure
// so the page can fall back to static content.
export async function cmsGet<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}/${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } catch {
    return null;
  }
}
