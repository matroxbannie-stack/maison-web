"use client";

import { useCallback, useEffect, useState } from "react";
import { Percent, Tag } from "lucide-react";
import {
  CARD,
  INPUT,
  BTN_DANGER,
  BTN_GHOST,
  BTN_PRIMARY,
  Block,
  Field,
  Notice,
  PageHeader,
  Pill,
  SkeletonBlock,
  Spinner,
  call,
  errMsg,
} from "@/components/admin/content/content-kit";
import { cn } from "@/lib/utils";

type Category = { id: number; name: string; slug: string; depth: number };
type PreviewData = { count: number; sample: { id: number; name: string; old_minor: number; new_minor: number }[] };
type Campaign = {
  id: string;
  name: string;
  percent: number;
  scope_label: string;
  started_at: string | null;
  ended_at: string | null;
  status: "active" | "ended";
  products_count: number;
  restored: number | null;
  skipped: number | null;
};

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const money = (minor: number) => usd.format(minor / 100);

function fmt(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export default function DealsPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [percent, setPercent] = useState(20);
  const [scope, setScope] = useState<"all" | "category">("all");
  const [categoryId, setCategoryId] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [busy, setBusy] = useState<"preview" | "apply" | string | null>(null);

  const load = useCallback(async () => {
    try {
      const [o, l] = await Promise.all([
        call<{ data: { categories: Category[] } }>("/admin/deals/options"),
        call<{ data: Campaign[] }>("/admin/deals"),
      ]);
      setCats(o.data.categories ?? []);
      setCampaigns(Array.isArray(l.data) ? l.data : []);
    } catch (e) {
      setError(errMsg(e));
      setCampaigns([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function body() {
    return {
      percent,
      scope,
      category_id: scope === "category" && categoryId ? Number(categoryId) : null,
    };
  }

  function validate(): string | null {
    if (scope === "category" && !categoryId) return "Please choose a category.";
    if (!Number.isFinite(percent) || percent < 5 || percent > 90) return "Discount must be between 5% and 90%.";
    return null;
  }

  async function runPreview() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setBusy("preview");
    setError(null);
    setInfo(null);
    try {
      const res = await call<{ data: PreviewData }>("/admin/deals/preview", { method: "POST", body: body() });
      setPreview(res.data);
    } catch (e) {
      setPreview(null);
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  }

  async function apply() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!name.trim()) {
      setError("Give the deal a name, for example Winter Sale.");
      return;
    }
    if (!window.confirm("Apply " + percent + "% off to " + (preview?.count ?? 0) + " products now? Prices change on the website immediately.")) return;
    setBusy("apply");
    setError(null);
    setInfo(null);
    try {
      await call("/admin/deals", { method: "POST", body: { ...body(), name: name.trim() } });
      setInfo("Deal applied. The new prices are live.");
      setPreview(null);
      setName("");
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  }

  async function endDeal(c: Campaign) {
    if (!window.confirm("End \"" + c.name + "\" and restore the old prices?")) return;
    setBusy(c.id);
    setError(null);
    setInfo(null);
    try {
      const res = await call<{ data: Campaign }>("/admin/deals/" + c.id + "/end", { method: "POST" });
      const r = res.data;
      setInfo("Deal ended. " + (r.restored ?? 0) + " prices restored" + ((r.skipped ?? 0) > 0 ? ", " + r.skipped + " skipped because the price was changed meanwhile." : "."));
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Deals and sales"
        subtitle="Put products on sale in one go. The old price shows crossed out on the website. Products that are already on sale are left alone."
      />

      <div className="mb-4 space-y-3">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {info ? <Notice tone="success">{info}</Notice> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className={cn(CARD, "p-6")}>
          <h2 className="font-heading text-lg font-semibold">Create a deal</h2>
          <div className="mt-5 space-y-5">
            <Field label="Deal name" hint="Only you see this. Example: Winter Sale">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={INPUT} placeholder="Winter Sale" />
            </Field>

            <Block label="Discount">
              <div className="flex flex-wrap items-center gap-2">
                {[10, 20, 30, 40, 50].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setPercent(p); setPreview(null); }}
                    className={cn(
                      "h-10 rounded-xl border px-4 text-sm font-medium transition",
                      percent === p ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"
                    )}
                  >
                    {p}%
                  </button>
                ))}
                <div className="relative w-28">
                  <input
                    type="number"
                    min={5}
                    max={90}
                    value={percent}
                    onChange={(e) => { setPercent(Number(e.target.value)); setPreview(null); }}
                    aria-label="Custom discount percent"
                    className={cn(INPUT, "pr-8")}
                  />
                  <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </Block>

            <Block label="Apply to">
              <div className="flex gap-2">
                {(["all", "category"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setScope(s); setPreview(null); }}
                    className={cn(
                      "h-10 flex-1 rounded-xl border text-sm font-medium transition",
                      scope === s ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"
                    )}
                  >
                    {s === "all" ? "All products" : "One category"}
                  </button>
                ))}
              </div>
              {scope === "category" ? (
                <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPreview(null); }} aria-label="Category" className={cn(INPUT, "mt-3")}>
                  <option value="">Choose a category...</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {"- ".repeat(c.depth) + c.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </Block>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void runPreview()} disabled={busy !== null} className={BTN_GHOST}>
                {busy === "preview" ? <Spinner /> : null} Preview prices
              </button>
              <button type="button" onClick={() => void apply()} disabled={busy !== null || !preview} className={BTN_PRIMARY}>
                {busy === "apply" ? <Spinner /> : <Tag className="h-4 w-4" />} Apply deal
              </button>
            </div>
            {!preview ? <p className="text-xs text-muted-foreground">Preview first, then apply.</p> : null}
          </div>

          {preview ? (
            <div className="mt-6 rounded-xl border border-border">
              <p className="border-b border-border px-4 py-3 text-sm font-medium">
                {preview.count} product{preview.count === 1 ? "" : "s"} will get {percent}% off
              </p>
              <div className="divide-y divide-border">
                {preview.sample.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="min-w-0 truncate">{s.name}</span>
                    <span className="shrink-0">
                      <span className="mr-2 text-muted-foreground line-through">{money(s.old_minor)}</span>
                      <span className="font-medium">{money(s.new_minor)}</span>
                    </span>
                  </div>
                ))}
              </div>
              {preview.count > preview.sample.length ? (
                <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                  and {preview.count - preview.sample.length} more
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className={cn(CARD, "p-6")}>
          <h2 className="font-heading text-lg font-semibold">Your deals</h2>
          <div className="mt-5 space-y-3">
            {campaigns === null ? (
              <>
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-24" />
              </>
            ) : campaigns.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No deals yet. Create your first one on the left.</p>
            ) : (
              campaigns.map((c) => (
                <div key={c.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{c.name}</h3>
                      <Pill tone={c.status === "active" ? "emerald" : "slate"}>{c.status === "active" ? "Live" : "Ended"}</Pill>
                    </div>
                    <span className="text-sm font-semibold">{c.percent}% off</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.scope_label} - {c.products_count} product{c.products_count === 1 ? "" : "s"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Started {fmt(c.started_at)}
                    {c.ended_at ? " - ended " + fmt(c.ended_at) : ""}
                  </p>
                  {c.status === "active" ? (
                    <button type="button" onClick={() => void endDeal(c)} disabled={busy !== null} className={cn(BTN_DANGER, "mt-3 h-9")}>
                      {busy === c.id ? <Spinner /> : null} End deal and restore prices
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}