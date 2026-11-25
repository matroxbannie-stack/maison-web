"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import {
  CARD,
  INPUT,
  TEXTAREA,
  BTN_DANGER,
  BTN_GHOST,
  BTN_PRIMARY,
  Block,
  Field,
  ImageUpload,
  Modal,
  Notice,
  PageHeader,
  Pill,
  SkeletonBlock,
  Spinner,
  Toggle,
  call,
  errMsg,
  fromLocalInput,
  toLocalInput,
} from "@/components/admin/content/content-kit";
import { cn } from "@/lib/utils";

type Slide = {
  id: number;
  headline: string;
  subheadline: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image_desktop: string;
  image_mobile: string | null;
  text_theme: "light" | "dark";
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  is_active: boolean;
};

type Draft = {
  id?: number;
  headline: string;
  subheadline: string;
  cta_label: string;
  cta_url: string;
  image_desktop: string;
  image_mobile: string;
  text_theme: "light" | "dark";
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

const EMPTY: Draft = {
  headline: "",
  subheadline: "",
  cta_label: "Shop now",
  cta_url: "/c/new-arrivals",
  image_desktop: "",
  image_mobile: "",
  text_theme: "light",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

function toDraft(s: Slide): Draft {
  return {
    id: s.id,
    headline: s.headline,
    subheadline: s.subheadline ?? "",
    cta_label: s.cta_label ?? "",
    cta_url: s.cta_url ?? "",
    image_desktop: s.image_desktop,
    image_mobile: s.image_mobile ?? "",
    text_theme: s.text_theme,
    starts_at: toLocalInput(s.starts_at),
    ends_at: toLocalInput(s.ends_at),
    is_active: s.is_active,
  };
}

function statusOf(s: Slide): { label: string; tone: "emerald" | "amber" | "slate" | "rose" } {
  if (!s.is_active) return { label: "Hidden", tone: "slate" };
  const now = Date.now();
  if (s.starts_at && new Date(s.starts_at).getTime() > now) return { label: "Scheduled", tone: "amber" };
  if (s.ends_at && new Date(s.ends_at).getTime() < now) return { label: "Expired", tone: "rose" };
  return { label: "Live", tone: "emerald" };
}

function fmt(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function HeroPreview({ draft }: { draft: Draft }) {
  const light = draft.text_theme === "light";
  return (
    <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-border bg-muted">
      {draft.image_desktop ? <img src={draft.image_desktop} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <div className={cn("absolute inset-0", light ? "bg-gradient-to-r from-black/55 to-transparent" : "bg-gradient-to-r from-white/70 to-transparent")} />
      <div className={cn("relative flex h-full max-w-[70%] flex-col justify-center gap-2 p-6", light ? "text-white" : "text-neutral-900")}>
        <p className="font-heading text-xl font-semibold leading-tight sm:text-2xl">{draft.headline || "Your headline"}</p>
        {draft.subheadline ? <p className="text-xs opacity-90 sm:text-sm">{draft.subheadline}</p> : null}
        {draft.cta_label ? (
          <span className={cn("mt-1 inline-flex w-fit rounded-full px-4 py-1.5 text-xs font-medium", light ? "bg-white text-black" : "bg-black text-white")}>
            {draft.cta_label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function HeroAdminPage() {
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await call<{ data: Slide[] }>("/admin/hero-slides");
      setSlides(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(errMsg(e));
      setSlides([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  async function save() {
    if (!draft) return;
    if (!draft.headline.trim()) {
      setFormError("Headline is required.");
      return;
    }
    if (!draft.image_desktop.trim()) {
      setFormError("Please add a desktop image.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const body = {
      headline: draft.headline.trim(),
      subheadline: draft.subheadline.trim() || null,
      cta_label: draft.cta_label.trim() || null,
      cta_url: draft.cta_url.trim() || null,
      image_desktop: draft.image_desktop.trim(),
      image_mobile: draft.image_mobile.trim() || null,
      text_theme: draft.text_theme,
      starts_at: fromLocalInput(draft.starts_at),
      ends_at: fromLocalInput(draft.ends_at),
      is_active: draft.is_active,
    };
    try {
      if (draft.id) await call("/admin/hero-slides/" + draft.id, { method: "PATCH", body });
      else await call("/admin/hero-slides", { method: "POST", body });
      setDraft(null);
      await load();
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(s: Slide) {
    try {
      await call("/admin/hero-slides/" + s.id, { method: "PATCH", body: { is_active: !s.is_active } });
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  }

  async function remove(s: Slide) {
    if (!window.confirm("Delete the slide \"" + s.headline + "\"?")) return;
    try {
      await call("/admin/hero-slides/" + s.id, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  }

  async function move(index: number, dir: -1 | 1) {
    if (!slides) return;
    const j = index + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[index], next[j]] = [next[j], next[index]];
    setSlides(next);
    try {
      await call("/admin/hero-slides/order", { method: "PATCH", body: { ids: next.map((s) => s.id) } });
    } catch (e) {
      setError(errMsg(e));
      await load();
    }
  }

  return (
    <div>
      <PageHeader
        title="Homepage hero"
        subtitle="The big slides at the top of the homepage. Slides show in this order. Use the schedule to run a campaign automatically."
        actions={
          <button type="button" onClick={() => { setFormError(null); setDraft({ ...EMPTY }); }} className={BTN_PRIMARY}>
            <Plus className="h-4 w-4" /> New slide
          </button>
        }
      />

      {error ? (
        <div className="mb-4">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}

      {slides === null ? (
        <div className="space-y-4">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
      ) : slides.length === 0 ? (
        <div className={cn(CARD, "px-6 py-16 text-center")}>
          <p className="font-medium">No slides yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first slide to customise the homepage.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((s, i) => {
            const st = statusOf(s);
            return (
              <div key={s.id} className={cn(CARD, "flex flex-col gap-4 overflow-hidden p-4 sm:flex-row")}>
                <div className="aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-56">
                  <img src={s.image_desktop} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-heading text-base font-semibold">{s.headline}</h3>
                    <Pill tone={st.tone}>{st.label}</Pill>
                  </div>
                  {s.subheadline ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.subheadline}</p> : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {s.cta_label ? "Button: " + s.cta_label + (s.cta_url ? " -> " + s.cta_url : "") : "No button"}
                  </p>
                  {s.starts_at || s.ends_at ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.starts_at ? "From " + fmt(s.starts_at) : ""} {s.ends_at ? "until " + fmt(s.ends_at) : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-start gap-2 sm:flex-col">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void move(i, -1)} disabled={i === 0} aria-label="Move up" className={cn(BTN_GHOST, "h-9 w-9 px-0")}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => void move(i, 1)} disabled={i === slides.length - 1} aria-label="Move down" className={cn(BTN_GHOST, "h-9 w-9 px-0")}>
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  <button type="button" onClick={() => { setFormError(null); setDraft(toDraft(s)); }} className={cn(BTN_GHOST, "h-9")}>
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button type="button" onClick={() => void toggle(s)} className={cn(BTN_GHOST, "h-9")}>
                    {s.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {s.is_active ? "Hide" : "Show"}
                  </button>
                  <button type="button" onClick={() => void remove(s)} className={cn(BTN_DANGER, "h-9")}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit slide" : "New slide"}
        wide
        footer={
          <>
            <button type="button" onClick={() => setDraft(null)} className={BTN_GHOST}>
              Cancel
            </button>
            <button type="button" onClick={() => void save()} disabled={saving} className={BTN_PRIMARY}>
              {saving ? <Spinner /> : null} Save slide
            </button>
          </>
        }
      >
        {draft ? (
          <div className="space-y-5">
            {formError ? <Notice tone="error">{formError}</Notice> : null}

            <HeroPreview draft={draft} />

            <div className="grid gap-5 md:grid-cols-2">
              <ImageUpload value={draft.image_desktop} onChange={(v) => set("image_desktop", v)} folder="hero" label="Desktop image" hint="Wide photo, at least 1920 px. Required." aspect="aspect-[16/9]" />
              <ImageUpload value={draft.image_mobile} onChange={(v) => set("image_mobile", v)} folder="hero" label="Mobile image (optional)" hint="Tall photo, for example 1080 x 1350." aspect="aspect-[4/5]" />
            </div>

            <Field label="Headline">
              <input value={draft.headline} onChange={(e) => set("headline", e.target.value)} maxLength={160} className={INPUT} placeholder="The new season is here" />
            </Field>
            <Field label="Sub headline (optional)">
              <textarea value={draft.subheadline} onChange={(e) => set("subheadline", e.target.value)} maxLength={260} className={TEXTAREA} placeholder="Short supporting sentence" />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Button text">
                <input value={draft.cta_label} onChange={(e) => set("cta_label", e.target.value)} maxLength={60} className={INPUT} />
              </Field>
              <Field label="Button link" hint="Example: /c/sale or /p/court-leather-sneaker">
                <input value={draft.cta_url} onChange={(e) => set("cta_url", e.target.value)} maxLength={300} className={INPUT} />
              </Field>
            </div>

            <Block label="Text colour" hint="Light text suits dark photos. Dark text suits bright photos.">
              <div className="flex gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("text_theme", t)}
                    className={cn(
                      "h-10 flex-1 rounded-xl border text-sm font-medium transition",
                      draft.text_theme === t ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"
                    )}
                  >
                    {t === "light" ? "Light text" : "Dark text"}
                  </button>
                ))}
              </div>
            </Block>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Start showing (optional)" hint="Leave empty to start now.">
                <input type="datetime-local" value={draft.starts_at} onChange={(e) => set("starts_at", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Stop showing (optional)" hint="Leave empty to keep it up.">
                <input type="datetime-local" value={draft.ends_at} onChange={(e) => set("ends_at", e.target.value)} className={INPUT} />
              </Field>
            </div>

            <Toggle checked={draft.is_active} onChange={(v) => set("is_active", v)} label="Visible on the website" hint="Turn off to hide this slide without deleting it." />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}