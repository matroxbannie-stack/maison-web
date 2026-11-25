"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Search, Trash2 } from "lucide-react";
import {
  CARD,
  INPUT,
  BTN_GHOST,
  BTN_PRIMARY,
  Notice,
  PageHeader,
  SkeletonBlock,
  Spinner,
  call,
  errMsg,
  uploadImage,
} from "@/components/admin/content/content-kit";
import { cn } from "@/lib/utils";

type ProductRow = { id: number; name: string; style_code?: string | null };
type ColorOpt = { product_color_id: number; name: string; hex_code: string };
type Img = {
  id: number;
  url: string;
  alt_text: string | null;
  product_color_id: number | null;
  sort_order: number;
  width: number | null;
  height: number | null;
};
type Detail = { product: { id: number; name: string; slug: string }; colors: ColorOpt[]; images: Img[] };
type Patch = { alt_text?: string | null; product_color_id?: number | null };

function PhotoCard({
  img,
  index,
  total,
  colors,
  onMove,
  onPatch,
  onDelete,
}: {
  img: Img;
  index: number;
  total: number;
  colors: ColorOpt[];
  onMove: (i: number, d: -1 | 1) => void;
  onPatch: (id: number, body: Patch) => Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [alt, setAlt] = useState(img.alt_text ?? "");

  useEffect(() => {
    setAlt(img.alt_text ?? "");
  }, [img.alt_text]);

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="relative aspect-[4/5] bg-muted">
        <img src={img.url} alt={img.alt_text ?? ""} className="h-full w-full object-cover" loading="lazy" />
        {index === 0 ? (
          <span className="absolute left-2 top-2 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium text-background">Cover</span>
        ) : null}
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            aria-label="Move earlier"
            className="rounded-lg bg-white/90 p-1.5 text-black shadow transition hover:bg-white disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            aria-label="Move later"
            className="rounded-lg bg-white/90 p-1.5 text-black shadow transition hover:bg-white disabled:opacity-40"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => {
            if (alt !== (img.alt_text ?? "")) void onPatch(img.id, { alt_text: alt.trim() === "" ? null : alt });
          }}
          placeholder="Describe the photo (alt text)"
          aria-label="Alt text"
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/40"
        />
        <div className="flex items-center gap-2">
          {colors.length > 0 ? (
            <select
              value={img.product_color_id ?? ""}
              onChange={(e) => void onPatch(img.id, { product_color_id: e.target.value ? Number(e.target.value) : null })}
              aria-label="Colour"
              className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-xs outline-none"
            >
              <option value="">All colours</option>
              {colors.map((c) => (
                <option key={c.product_color_id} value={c.product_color_id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="flex-1 text-xs text-muted-foreground">No colours on this product</span>
          )}
          <button
            type="button"
            onClick={() => onDelete(img.id)}
            aria-label="Delete photo"
            className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductPhotosPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selId, setSelId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [colorForNew, setColorForNew] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await call<{ data: ProductRow[] }>("/admin/products", {
          query: { q: q.trim() || undefined, per_page: 15 },
          signal: ctrl.signal,
        });
        setResults(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!ctrl.signal.aborted) setError(errMsg(e));
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await call<{ data: Detail }>("/admin/products/" + id + "/images");
      setDetail(res.data);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selId !== null) void load(selId);
  }, [selId, load]);

  function pick(id: number) {
    setDetail(null);
    setColorForNew("");
    setUrlInput("");
    setSelId(id);
  }

  async function onFiles(files: FileList | null) {
    if (!files || !detail) return;
    const list = Array.from(files);
    setError(null);
    for (let i = 0; i < list.length; i++) {
      setBusy("Uploading " + (i + 1) + " of " + list.length + "...");
      try {
        const up = await uploadImage(list[i], "products");
        await call("/admin/products/" + detail.product.id + "/images", {
          method: "POST",
          body: {
            url: up.url,
            width: up.width,
            height: up.height,
            alt_text: detail.product.name,
            product_color_id: colorForNew ? Number(colorForNew) : null,
          },
        });
      } catch (e) {
        setError(list[i].name + ": " + errMsg(e));
        break;
      }
    }
    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
    await load(detail.product.id);
  }

  async function addByUrl() {
    if (!detail || !urlInput.trim()) return;
    setBusy("Adding photo...");
    setError(null);
    try {
      await call("/admin/products/" + detail.product.id + "/images", {
        method: "POST",
        body: {
          url: urlInput.trim(),
          alt_text: detail.product.name,
          product_color_id: colorForNew ? Number(colorForNew) : null,
        },
      });
      setUrlInput("");
      await load(detail.product.id);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    if (!detail) return;
    const j = index + dir;
    if (j < 0 || j >= detail.images.length) return;
    const imgs = [...detail.images];
    [imgs[index], imgs[j]] = [imgs[j], imgs[index]];
    setDetail({ ...detail, images: imgs });
    try {
      await call("/admin/products/" + detail.product.id + "/images/order", {
        method: "PATCH",
        body: { ids: imgs.map((i) => i.id) },
      });
    } catch (e) {
      setError(errMsg(e));
      await load(detail.product.id);
    }
  }

  async function patchImage(id: number, body: Patch) {
    try {
      await call("/admin/product-images/" + id, { method: "PATCH", body });
      setDetail((d) => (d ? { ...d, images: d.images.map((i) => (i.id === id ? { ...i, ...body } : i)) } : d));
    } catch (e) {
      setError(errMsg(e));
    }
  }

  async function removeImage(id: number) {
    if (!detail) return;
    if (!window.confirm("Delete this photo from the product?")) return;
    try {
      await call("/admin/product-images/" + id, { method: "DELETE" });
      await load(detail.product.id);
    } catch (e) {
      setError(errMsg(e));
    }
  }

  return (
    <div>
      <PageHeader
        title="Product photos"
        subtitle="Upload, arrange and describe the photos shown on each product page. The first photo is the cover image."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={cn(CARD, "p-3 lg:sticky lg:top-24 lg:self-start")}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className={cn(INPUT, "pl-10")}
            />
          </div>
          <div className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto">
            {searching && results.length === 0 ? (
              <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                <Spinner /> Searching...
              </div>
            ) : null}
            {!searching && results.length === 0 ? <p className="px-2 py-3 text-sm text-muted-foreground">No products found.</p> : null}
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pick(p.id)}
                className={cn(
                  "block w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-muted",
                  selId === p.id ? "bg-muted" : ""
                )}
              >
                <span className="block truncate text-sm font-medium">{p.name}</span>
                {p.style_code ? <span className="block truncate text-xs text-muted-foreground">{p.style_code}</span> : null}
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          {error ? (
            <div className="mb-4">
              <Notice tone="error">{error}</Notice>
            </div>
          ) : null}

          {selId === null ? (
            <div className={cn(CARD, "flex flex-col items-center justify-center px-6 py-20 text-center")}>
              <ImagePlus className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Choose a product</p>
              <p className="mt-1 text-sm text-muted-foreground">Pick a product on the left to manage its photos.</p>
            </div>
          ) : loading && !detail ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <SkeletonBlock className="aspect-[4/5]" />
              <SkeletonBlock className="aspect-[4/5]" />
              <SkeletonBlock className="aspect-[4/5]" />
            </div>
          ) : detail ? (
            <div className="space-y-5">
              <div className={cn(CARD, "p-5")}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-lg font-semibold">{detail.product.name}</h2>
                    <p className="text-sm text-muted-foreground">{detail.images.length} photo{detail.images.length === 1 ? "" : "s"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {detail.colors.length > 0 ? (
                      <select
                        value={colorForNew}
                        onChange={(e) => setColorForNew(e.target.value)}
                        aria-label="Colour for new photos"
                        className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none"
                      >
                        <option value="">New photos: all colours</option>
                        {detail.colors.map((c) => (
                          <option key={c.product_color_id} value={c.product_color_id}>
                            New photos: {c.name}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={busy !== null} className={BTN_PRIMARY}>
                      {busy ? <Spinner /> : <ImagePlus className="h-4 w-4" />} Upload photos
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="relative min-w-[240px] flex-1">
                    <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Or paste an image link (https://...)"
                      aria-label="Image link"
                      className={cn(INPUT, "pl-10")}
                    />
                  </div>
                  <button type="button" onClick={() => void addByUrl()} disabled={busy !== null || !urlInput.trim()} className={BTN_GHOST}>
                    Add link
                  </button>
                </div>

                {busy ? (
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner /> {busy}
                  </p>
                ) : null}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void onFiles(e.target.files)}
                />
              </div>

              {detail.images.length === 0 ? (
                <div className={cn(CARD, "px-6 py-14 text-center")}>
                  <p className="font-medium">No photos yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Upload the first photo. It becomes the cover image.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {detail.images.map((img, i) => (
                    <PhotoCard
                      key={img.id}
                      img={img}
                      index={i}
                      total={detail.images.length}
                      colors={detail.colors}
                      onMove={(idx, d) => void move(idx, d)}
                      onPatch={patchImage}
                      onDelete={(id) => void removeImage(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}