"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  SatelliteDish,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { VisitorLog } from "@/lib/types";

export function VisitorsTable({
  initialVisitors,
}: {
  initialVisitors: VisitorLog[];
}) {
  const [visitors, setVisitors] = useState(initialVisitors);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return visitors;
    return visitors.filter((visitor) =>
      [
        visitor.ip,
        visitor.country,
        visitor.city,
        visitor.device,
        visitor.browser,
        visitor.os,
        visitor.path,
        visitor.referer,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [visitors, query]);

  async function refresh() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/visitors", {
        cache: "no-store",
      });
      const data = (await response.json()) as { visitors?: VisitorLog[] };
      if (data.visitors) setVisitors(data.visitors);
      toast("🔄 Refreshed", "success");
    } catch {
      toast("Refresh failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function clearAll() {
    if (!confirm("Saare visitor logs delete karne hain?")) return;
    setBusy(true);
    try {
      await fetch("/api/admin/visitors", { method: "DELETE" });
      setVisitors([]);
      toast("🧹 Logs cleared", "success");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(visible, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `timepass-visitors-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast("📄 JSON exported", "success");
  }

  return (
    <>
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search IP, country, device…"
              className="w-full rounded-xl border border-line bg-white/[0.04] py-2.5 pl-9 pr-3 text-[12px] text-ink outline-none transition placeholder:text-faint focus:border-accent"
            />
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={busy}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-white/[0.04] px-3.5 py-2.5 font-display text-[10px] font-extrabold tracking-[1.1px] text-muted transition hover:border-accent hover:text-white disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            REFRESH
          </button>
          <button
            type="button"
            onClick={exportJson}
            disabled={!visible.length}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-white/[0.04] px-3.5 py-2.5 font-display text-[10px] font-extrabold tracking-[1.1px] text-muted transition hover:border-cyan hover:text-cyan disabled:opacity-40"
          >
            <Download className="size-3.5" /> JSON
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={busy || !visitors.length}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-pink/35 px-3.5 py-2.5 font-display text-[10px] font-extrabold tracking-[1.1px] text-pink transition hover:bg-pink/15 disabled:opacity-40"
          >
            <Trash2 className="size-3.5" /> CLEAR
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="glass mt-4 rounded-2xl px-6 py-16 text-center">
          <SatelliteDish className="mx-auto size-8 text-faint" />
          <p className="mt-3 font-display text-[13px] font-extrabold">
            No visitor logs yet
          </p>
          <p className="mt-1 text-[11.5px] text-faint">
            Site pe koi visit karega toh yahan real-time dikhega.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {visible.slice(0, 100).map((visitor, index) => (
            <article key={visitor.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-display text-[10px] font-extrabold tracking-[1.2px] text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  VISIT {index + 1}
                </span>
                <time className="font-mono text-[10.5px] text-faint">
                  {new Date(visitor.time).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
                <Field label="IP" value={visitor.ip} mono />
                <Field
                  label="Location"
                  value={
                    [visitor.city, visitor.region, visitor.country]
                      .filter((v) => v && v !== "?")
                      .join(", ") || "Unknown"
                  }
                />
                <Field label="Device" value={visitor.device} />
                <Field label="OS" value={visitor.os} />
                <Field label="Browser" value={visitor.browser} />
                <Field label="Screen" value={visitor.screen} mono />
                <Field label="Path" value={visitor.path} mono />
                <Field label="Referer" value={visitor.referer} />
              </dl>
            </article>
          ))}
          {visible.length > 100 ? (
            <p className="py-3 text-center text-[11px] text-faint">
              Showing latest 100 of {visible.length} — full data JSON export me
              milega.
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd
        className={`mt-0.5 truncate text-[11.5px] font-semibold text-ink ${mono ? "font-mono" : ""}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
