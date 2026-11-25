"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  CARD,
  INPUT,
  TEXTAREA,
  BTN_GHOST,
  BTN_PRIMARY,
  Block,
  Field,
  ImageUpload,
  Notice,
  PageHeader,
  SkeletonBlock,
  Spinner,
  Toggle,
  call,
  errMsg,
  fromLocalInput,
  toLocalInput,
} from "@/components/admin/content/content-kit";
import { cn } from "@/lib/utils";

/* ------------------------------ announcement bar ------------------------------ */
type Msg = { text: string; link_label: string; link_url: string };
type Style = "dark" | "light" | "accent";
type Ann = { enabled: boolean; style: Style; rotate_seconds: number; starts_at: string; ends_at: string; messages: Msg[] };
type AnnApi = {
  enabled: boolean;
  style: Style;
  rotate_seconds: number;
  starts_at: string | null;
  ends_at: string | null;
  messages: { text: string; link_label?: string | null; link_url?: string | null }[];
};

const BAR_STYLES: Record<Style, string> = {
  dark: "bg-black text-white",
  light: "border border-border bg-muted text-foreground",
  accent: "bg-accent text-accent-foreground",
};

function AnnouncementCard() {
  const [v, setV] = useState<Ann | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await call<{ data: AnnApi }>("/admin/storefront/announcement");
        const d = res.data;
        setV({
          enabled: d.enabled,
          style: d.style,
          rotate_seconds: d.rotate_seconds,
          starts_at: toLocalInput(d.starts_at),
          ends_at: toLocalInput(d.ends_at),
          messages: (d.messages ?? []).map((m) => ({ text: m.text, link_label: m.link_label ?? "", link_url: m.link_url ?? "" })),
        });
      } catch (e) {
        setError(errMsg(e));
      }
    })();
  }, []);

  function patch(p: Partial<Ann>) {
    setSaved(false);
    setV((cur) => (cur ? { ...cur, ...p } : cur));
  }

  function setMsg(i: number, p: Partial<Msg>) {
    if (!v) return;
    patch({ messages: v.messages.map((m, idx) => (idx === i ? { ...m, ...p } : m)) });
  }

  async function save() {
    if (!v) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await call("/admin/storefront/announcement", {
        method: "PUT",
        body: {
          enabled: v.enabled,
          style: v.style,
          rotate_seconds: v.rotate_seconds,
          starts_at: fromLocalInput(v.starts_at),
          ends_at: fromLocalInput(v.ends_at),
          messages: v.messages
            .filter((m) => m.text.trim() !== "")
            .map((m) => ({
              text: m.text.trim(),
              link_label: m.link_label.trim() || null,
              link_url: m.link_url.trim() || null,
            })),
        },
      });
      setSaved(true);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  if (!v) return error ? <Notice tone="error">{error}</Notice> : <SkeletonBlock className="h-72" />;

  const first = v.messages.find((m) => m.text.trim() !== "");

  return (
    <section className={cn(CARD, "p-6")}>
      <h2 className="font-heading text-lg font-semibold">Announcement bar</h2>
      <p className="mt-1 text-sm text-muted-foreground">The thin bar at the very top of every page. Good for free shipping, sales and short notices.</p>

      <div className="mt-5 space-y-5">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {saved ? <Notice tone="success">Saved. Visitors will see the change shortly.</Notice> : null}

        <div>
          <p className="mb-1.5 text-sm font-medium">Preview</p>
          <div className={cn("flex h-10 items-center justify-center rounded-xl px-4 text-xs font-medium", BAR_STYLES[v.style])}>
            {first ? (
              <span>
                {first.text}
                {first.link_label ? <span className="ml-2 underline underline-offset-2">{first.link_label}</span> : null}
              </span>
            ) : (
              <span className="opacity-60">Your message will appear here</span>
            )}
          </div>
        </div>

        <Toggle checked={v.enabled} onChange={(x) => patch({ enabled: x })} label="Show the bar" hint="Turn off to hide it everywhere." />

        <Block label="Messages (up to 5)" hint="With more than one message, the bar rotates through them.">
          <div className="space-y-3">
            {v.messages.map((m, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="flex gap-2">
                  <input
                    value={m.text}
                    onChange={(e) => setMsg(i, { text: e.target.value })}
                    maxLength={140}
                    placeholder="Free delivery on orders over $100"
                    aria-label={"Message " + (i + 1)}
                    className={INPUT}
                  />
                  <button
                    type="button"
                    onClick={() => patch({ messages: v.messages.filter((_, idx) => idx !== i) })}
                    aria-label="Remove message"
                    className="shrink-0 rounded-xl border border-border px-3 text-muted-foreground transition hover:bg-muted hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input value={m.link_label} onChange={(e) => setMsg(i, { link_label: e.target.value })} maxLength={40} placeholder="Link text (optional)" aria-label="Link text" className={INPUT} />
                  <input value={m.link_url} onChange={(e) => setMsg(i, { link_url: e.target.value })} maxLength={300} placeholder="Link, for example /c/sale" aria-label="Link" className={INPUT} />
                </div>
              </div>
            ))}
            {v.messages.length < 5 ? (
              <button type="button" onClick={() => patch({ messages: [...v.messages, { text: "", link_label: "", link_url: "" }] })} className={BTN_GHOST}>
                <Plus className="h-4 w-4" /> Add message
              </button>
            ) : null}
          </div>
        </Block>

        <div className="grid gap-5 md:grid-cols-2">
          <Block label="Colour">
            <div className="flex gap-2">
              {(["dark", "light", "accent"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => patch({ style: s })}
                  className={cn(
                    "h-10 flex-1 rounded-xl border text-sm font-medium capitalize transition",
                    v.style === s ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </Block>
          <Field label="Seconds per message">
            <input type="number" min={3} max={20} value={v.rotate_seconds} onChange={(e) => patch({ rotate_seconds: Math.min(20, Math.max(3, Number(e.target.value) || 5)) })} className={INPUT} />
          </Field>
          <Field label="Start showing (optional)">
            <input type="datetime-local" value={v.starts_at} onChange={(e) => patch({ starts_at: e.target.value })} className={INPUT} />
          </Field>
          <Field label="Stop showing (optional)">
            <input type="datetime-local" value={v.ends_at} onChange={(e) => patch({ ends_at: e.target.value })} className={INPUT} />
          </Field>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={() => void save()} disabled={saving} className={BTN_PRIMARY}>
            {saving ? <Spinner /> : null} Save announcement bar
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ promo banner / popup ------------------------------ */
type Promo = {
  enabled: boolean;
  kind: "banner" | "popup";
  theme: "light" | "dark";
  title: string;
  text: string;
  cta_label: string;
  cta_url: string;
  image_url: string;
  dismissible: boolean;
  starts_at: string;
  ends_at: string;
};
type PromoApi = Omit<Promo, "starts_at" | "ends_at"> & { starts_at: string | null; ends_at: string | null };

function PromoCard() {
  const [v, setV] = useState<Promo | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await call<{ data: PromoApi }>("/admin/storefront/promo");
        const d = res.data;
        setV({ ...d, starts_at: toLocalInput(d.starts_at), ends_at: toLocalInput(d.ends_at) });
      } catch (e) {
        setError(errMsg(e));
      }
    })();
  }, []);

  function patch(p: Partial<Promo>) {
    setSaved(false);
    setV((cur) => (cur ? { ...cur, ...p } : cur));
  }

  async function save() {
    if (!v) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await call("/admin/storefront/promo", {
        method: "PUT",
        body: {
          enabled: v.enabled,
          kind: v.kind,
          theme: v.theme,
          title: v.title.trim() || null,
          text: v.text.trim() || null,
          cta_label: v.cta_label.trim() || null,
          cta_url: v.cta_url.trim() || null,
          image_url: v.image_url.trim() || null,
          dismissible: v.dismissible,
          starts_at: fromLocalInput(v.starts_at),
          ends_at: fromLocalInput(v.ends_at),
        },
      });
      setSaved(true);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  if (!v) return error ? <Notice tone="error">{error}</Notice> : <SkeletonBlock className="h-96" />;

  const dark = v.theme === "dark";

  return (
    <section className={cn(CARD, "p-6")}>
      <h2 className="font-heading text-lg font-semibold">Promo message</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A message with a picture and button for your visitors, for example a sale, a festival offer or a new collection. Show it as a banner on the homepage, or as a popup.
      </p>

      <div className="mt-5 space-y-5">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {saved ? <Notice tone="success">Saved. Visitors will see the change shortly.</Notice> : null}

        <div>
          <p className="mb-1.5 text-sm font-medium">Preview</p>
          <div className={cn("relative overflow-hidden rounded-2xl border border-border", dark ? "bg-neutral-900 text-white" : "bg-white text-neutral-900")}>
            <div className="flex flex-col sm:flex-row">
              {v.image_url ? <img src={v.image_url} alt="" className="h-40 w-full object-cover sm:h-auto sm:w-2/5" /> : null}
              <div className="flex flex-1 flex-col justify-center gap-2 p-6">
                <p className="font-heading text-xl font-semibold">{v.title || "Your title"}</p>
                {v.text ? <p className="text-sm opacity-80">{v.text}</p> : null}
                {v.cta_label ? (
                  <span className={cn("mt-1 inline-flex w-fit rounded-full px-4 py-2 text-xs font-medium", dark ? "bg-white text-black" : "bg-black text-white")}>{v.cta_label}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <Toggle checked={v.enabled} onChange={(x) => patch({ enabled: x })} label="Show this promo" hint="Turn off to hide it everywhere." />

        <div className="grid gap-5 md:grid-cols-2">
          <Block label="Show as">
            <div className="flex gap-2">
              {(["banner", "popup"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => patch({ kind: k })}
                  className={cn(
                    "h-10 flex-1 rounded-xl border text-sm font-medium capitalize transition",
                    v.kind === k ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </Block>
          <Block label="Colour">
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => patch({ theme: t })}
                  className={cn(
                    "h-10 flex-1 rounded-xl border text-sm font-medium capitalize transition",
                    v.theme === t ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Block>
        </div>

        <ImageUpload value={v.image_url} onChange={(x) => patch({ image_url: x })} folder="banners" label="Picture (optional)" aspect="aspect-[16/9]" />

        <Field label="Title">
          <input value={v.title} onChange={(e) => patch({ title: e.target.value })} maxLength={80} placeholder="Winter Sale: up to 40% off" className={INPUT} />
        </Field>
        <Field label="Message">
          <textarea value={v.text} onChange={(e) => patch({ text: e.target.value })} maxLength={240} placeholder="Short text that explains the offer" className={TEXTAREA} />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Button text">
            <input value={v.cta_label} onChange={(e) => patch({ cta_label: e.target.value })} maxLength={40} placeholder="Shop the sale" className={INPUT} />
          </Field>
          <Field label="Button link">
            <input value={v.cta_url} onChange={(e) => patch({ cta_url: e.target.value })} maxLength={300} placeholder="/c/sale" className={INPUT} />
          </Field>
          <Field label="Start showing (optional)">
            <input type="datetime-local" value={v.starts_at} onChange={(e) => patch({ starts_at: e.target.value })} className={INPUT} />
          </Field>
          <Field label="Stop showing (optional)">
            <input type="datetime-local" value={v.ends_at} onChange={(e) => patch({ ends_at: e.target.value })} className={INPUT} />
          </Field>
        </div>

        <Toggle checked={v.dismissible} onChange={(x) => patch({ dismissible: x })} label="Visitors can close it" hint="Recommended. A closed popup stays closed for the rest of the visit." />

        <div className="flex justify-end">
          <button type="button" onClick={() => void save()} disabled={saving} className={BTN_PRIMARY}>
            {saving ? <Spinner /> : null} Save promo message
          </button>
        </div>
      </div>
    </section>
  );
}

export default function MessagesPage() {
  return (
    <div>
      <PageHeader title="Site messages" subtitle="Talk to your visitors: a top announcement bar and a promo banner or popup. Everything can be scheduled." />
      <div className="space-y-6">
        <AnnouncementCard />
        <PromoCard />
      </div>
    </div>
  );
}