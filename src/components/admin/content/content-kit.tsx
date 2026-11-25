"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ------------------------------ styles ------------------------------ */
export const CARD = "rounded-2xl border border-border bg-background shadow-sm";
export const INPUT =
  "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition focus:border-foreground/40 focus:ring-4 focus:ring-foreground/5 disabled:opacity-60";
export const TEXTAREA =
  "min-h-[96px] w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-4 focus:ring-foreground/5 disabled:opacity-60";
const BTN =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
export const BTN_PRIMARY = BTN + " bg-foreground text-background hover:opacity-90";
export const BTN_GHOST = BTN + " border border-border bg-background hover:bg-muted";
export const BTN_DANGER =
  BTN + " border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40";

/* ------------------------------ api helpers ------------------------------ */
type Opts = NonNullable<Parameters<typeof adminFetch>[1]>;

export async function call<T = unknown>(path: string, opts?: Opts): Promise<T> {
  const res = await adminFetch<T>(path, opts ?? ({} as Opts));
  return res as T;
}

export function errMsg(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong. Please try again.";
}

/* ------------------------------ dates ------------------------------ */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes());
}

export function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/* ------------------------------ small UI ------------------------------ */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function Block({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden="true" />;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: ReactNode }) {
  const tones = {
    info: "border-border bg-muted/60 text-foreground",
    error: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone])}>
      {children}
    </div>
  );
}

export function Pill({ tone, children }: { tone: "emerald" | "amber" | "sky" | "slate" | "rose"; children: ReactNode }) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    slate: "bg-muted text-muted-foreground",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-muted", className)} />;
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 text-left transition hover:bg-muted/60"
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-emerald-500" : "bg-border")}>
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl sm:rounded-3xl",
          wide ? "sm:max-w-4xl" : "sm:max-w-xl"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

/* ------------------------------ image upload ------------------------------ */
export type MediaFolder = "products" | "hero" | "banners" | "collections" | "misc";
export type UploadedImage = { url: string; width: number; height: number };

async function fileToUploadData(file: File, maxSide = 2400): Promise<string> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    throw new Error("Please choose a JPG, PNG, WebP or GIF image.");
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("This image is larger than 25 MB. Please choose a smaller one.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read this image."));
      el.src = objectUrl;
    });

    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser cannot process images.");
    ctx.drawImage(img, 0, 0, w, h);

    let data = canvas.toDataURL("image/webp", 0.86);
    if (!data.startsWith("data:image/webp")) data = canvas.toDataURL("image/jpeg", 0.88);
    return data;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadImage(file: File, folder: MediaFolder): Promise<UploadedImage> {
  const data = await fileToUploadData(file);
  const res = await call<{ data: UploadedImage }>("/admin/media", { method: "POST", body: { data, folder } });
  return res.data;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  label,
  hint,
  aspect = "aspect-[16/9]",
}: {
  value: string;
  onChange: (url: string) => void;
  folder: MediaFolder;
  label: string;
  hint?: string;
  aspect?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setBusy(true);
      setError(null);
      try {
        const up = await uploadImage(file, folder);
        onChange(up.url);
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setBusy(false);
      }
    },
    [folder, onChange]
  );

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Link2 className="h-3.5 w-3.5" /> {showUrl ? "Hide link" : "Use image link"}
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed bg-muted/40 transition",
          aspect,
          drag ? "border-foreground bg-muted" : "border-border"
        )}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground transition hover:text-foreground"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-sm font-medium">Drop an image here or click to upload</span>
            <span className="text-xs">JPG, PNG, WebP or GIF</span>
          </button>
        )}

        {value ? (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-black transition hover:bg-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black/80"
            >
              Remove
            </button>
          </div>
        ) : null}

        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-sm font-medium backdrop-blur-sm">
            <Spinner /> Uploading...
          </div>
        ) : null}
      </div>

      {showUrl ? (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className={cn(INPUT, "mt-2")}
          aria-label={label + " link"}
        />
      ) : null}

      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}