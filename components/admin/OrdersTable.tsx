"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Check,
  X,
  Trash2,
  Download,
  RefreshCw,
  Loader2,
  StickyNote,
  Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/plans";
import { ALL_STATUSES, STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import type { Order, OrderStatus } from "@/lib/types";

type Filter = OrderStatus | "all";

export function OrdersTable({
  initialOrders,
  initialStatus,
  initialQuery,
}: {
  initialOrders: Order[];
  initialStatus: string;
  initialQuery: string;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<Filter>(
    ALL_STATUSES.includes(initialStatus as OrderStatus)
      ? (initialStatus as OrderStatus)
      : "all",
  );
  const [query, setQuery] = useState(initialQuery);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    for (const status of ALL_STATUSES) {
      map[status] = orders.filter((order) => order.status === status).length;
    }
    return map;
  }, [orders]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (!needle) return true;
      return (
        order.id.toLowerCase().includes(needle) ||
        order.packName.toLowerCase().includes(needle) ||
        order.plan.toLowerCase().includes(needle) ||
        String(order.amount).includes(needle) ||
        (order.contact ?? "").toLowerCase().includes(needle) ||
        (order.meta?.country ?? "").toLowerCase().includes(needle)
      );
    });
  }, [orders, filter, query]);

  const visibleRevenue = visible
    .filter((order) => order.status !== "rejected")
    .reduce((total, order) => total + order.amount, 0);

  async function refresh() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      const data = (await response.json()) as { orders?: Order[] };
      if (data.orders) setOrders(data.orders);
      toast("🔄 Refreshed", "success");
    } catch {
      toast("Refresh failed", "error");
    } finally {
      setRefreshing(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { order?: Order };
      if (response.ok && data.order) {
        setOrders((prev) =>
          prev.map((order) => (order.id === id ? data.order! : order)),
        );
        toast("✅ Order updated", "success");
        router.refresh();
      } else {
        toast("Update failed", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm(`Order ${id} permanently delete karna hai?`)) return;
    setBusyId(id);
    try {
      const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (response.ok) {
        setOrders((prev) => prev.filter((order) => order.id !== id));
        toast("🗑 Order deleted", "success");
        router.refresh();
      } else {
        toast("Delete failed", "error");
      }
    } finally {
      setBusyId(null);
    }
  }

  function exportCsv() {
    const header = [
      "Order ID",
      "Pack",
      "Plan",
      "Amount",
      "Status",
      "Method",
      "Country",
      "City",
      "Device",
      "Note",
      "Created (IST)",
    ];
    const rows = visible.map((order) => [
      order.id,
      order.packName,
      order.plan,
      order.amount,
      order.status,
      order.method,
      order.meta?.country ?? "",
      order.meta?.city ?? "",
      order.meta?.device ?? "",
      (order.note ?? "").replaceAll('"', "'"),
      new Date(order.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `timepass-orders-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast("📄 CSV exported", "success");
  }

  return (
    <>
      {/* Toolbar */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", ...ALL_STATUSES] as Filter[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 font-display text-[10px] font-extrabold tracking-[1.1px] transition ${
                filter === status
                  ? "border-accent bg-accent/18 text-white"
                  : "border-line bg-white/[0.03] text-muted hover:border-line-hi hover:text-ink"
              }`}
            >
              {status === "all" ? "ALL" : STATUS_LABEL[status].toUpperCase()}
              <span className="ml-1.5 text-faint">{counts[status] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order ID, pack, amount…"
              className="w-full rounded-xl border border-line bg-white/[0.04] py-2.5 pl-9 pr-3 text-[12px] text-ink outline-none transition placeholder:text-faint focus:border-accent"
            />
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-white/[0.04] px-3.5 py-2.5 font-display text-[10px] font-extrabold tracking-[1.1px] text-muted transition hover:border-accent hover:text-white disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            REFRESH
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!visible.length}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-white/[0.04] px-3.5 py-2.5 font-display text-[10px] font-extrabold tracking-[1.1px] text-muted transition hover:border-cyan hover:text-cyan disabled:opacity-40"
          >
            <Download className="size-3.5" /> CSV
          </button>
        </div>

        <p className="mt-3 border-t border-line pt-3 text-[11px] text-faint">
          Showing <b className="text-muted">{visible.length}</b> of{" "}
          {orders.length} orders ·{" "}
          <b className="text-lime">{formatINR(visibleRevenue)}</b> value
        </p>
      </div>

      {/* Rows */}
      {visible.length === 0 ? (
        <div className="glass mt-4 rounded-2xl px-6 py-16 text-center">
          <Inbox className="mx-auto size-8 text-faint" />
          <p className="mt-3 font-display text-[13px] font-extrabold">
            No orders found
          </p>
          <p className="mt-1 text-[11.5px] text-faint">
            {orders.length
              ? "Filter ya search change karke dekho."
              : "Pehla order aate hi yahan dikhega."}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {visible.map((order) => {
            const busy = busyId === order.id;
            return (
              <article
                key={order.id}
                className={`glass rounded-2xl p-4 transition ${busy ? "opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-[13px] font-bold text-cyan">
                        {order.id}
                      </code>
                      <Badge tone={STATUS_TONE[order.status]}>
                        {STATUS_LABEL[order.status]}
                      </Badge>
                      <Badge tone="muted">{order.method.toUpperCase()}</Badge>
                    </div>
                    <p className="mt-1.5 text-[12.5px] font-semibold">
                      {order.packName} · {order.plan}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-faint">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {order.meta?.country && order.meta.country !== "?"
                        ? ` · ${[order.meta.city, order.meta.country].filter((v) => v && v !== "?").join(", ")}`
                        : ""}
                      {order.meta?.device ? ` · ${order.meta.device}` : ""}
                    </p>
                    {order.note ? (
                      <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-line bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-muted">
                        <StickyNote className="mt-0.5 size-3 shrink-0 text-amber" />
                        {order.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <b className="font-mono text-xl font-bold text-lime">
                      {formatINR(order.amount)}
                    </b>
                  </div>
                </div>

                <div className="mt-3.5 flex flex-wrap gap-2 border-t border-line pt-3">
                  {order.status !== "active" ? (
                    <ActionButton
                      onClick={() => patch(order.id, { status: "active" })}
                      disabled={busy}
                      tone="lime"
                      icon={<Check className="size-3.5" />}
                    >
                      APPROVE
                    </ActionButton>
                  ) : null}
                  {order.status !== "rejected" ? (
                    <ActionButton
                      onClick={() => patch(order.id, { status: "rejected" })}
                      disabled={busy}
                      tone="pink"
                      icon={<X className="size-3.5" />}
                    >
                      REJECT
                    </ActionButton>
                  ) : null}
                  {order.status !== "pending" ? (
                    <ActionButton
                      onClick={() => patch(order.id, { status: "pending" })}
                      disabled={busy}
                      tone="muted"
                      icon={<RefreshCw className="size-3.5" />}
                    >
                      RESET
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    onClick={() => {
                      setNoteFor(order.id);
                      setNoteText(order.note ?? "");
                    }}
                    disabled={busy}
                    tone="muted"
                    icon={<StickyNote className="size-3.5" />}
                  >
                    NOTE
                  </ActionButton>
                  <ActionButton
                    onClick={() => remove(order.id)}
                    disabled={busy}
                    tone="pink"
                    icon={<Trash2 className="size-3.5" />}
                  >
                    DELETE
                  </ActionButton>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Note modal */}
      {noteFor ? (
        <div
          className="fixed inset-0 z-[1700] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setNoteFor(null)}
        >
          <div
            className="glass w-full max-w-sm rounded-3xl p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow text-amber">Internal Note</p>
            <h3 className="mt-1 font-display text-[15px] font-extrabold">
              {noteFor}
            </h3>
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="e.g. UTR 4839xxxx verified, access de diya"
              className="mt-4 w-full resize-none rounded-2xl border border-line bg-white/[0.04] px-4 py-3 text-[12.5px] text-ink outline-none transition placeholder:text-faint focus:border-accent"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNoteFor(null)}
                className="cursor-pointer rounded-xl border border-line bg-white/[0.04] px-4 py-2.5 font-display text-[10.5px] font-extrabold tracking-[1.2px] text-muted transition hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  void patch(noteFor, { note: noteText });
                  setNoteFor(null);
                }}
                className="grad-bg cursor-pointer rounded-xl px-4 py-2.5 font-display text-[10.5px] font-extrabold tracking-[1.2px] text-white transition hover:brightness-110"
              >
                SAVE NOTE
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone: "lime" | "pink" | "muted";
  icon: React.ReactNode;
}) {
  const tones = {
    lime: "border-lime/35 text-lime hover:bg-lime/15",
    pink: "border-pink/35 text-pink hover:bg-pink/15",
    muted: "border-line text-muted hover:bg-white/8 hover:text-ink",
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 font-display text-[10px] font-extrabold tracking-[1.1px] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {icon}
      {children}
    </button>
  );
}
