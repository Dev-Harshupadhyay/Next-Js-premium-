import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Send,
  ArrowLeft,
  Package,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { getOrder, getSettings } from "@/lib/db";
import { formatINR } from "@/lib/plans";
import { STATUS_LABEL, STATUS_TONE, STATUS_HELP } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Status",
  robots: { index: false, follow: false },
};

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getOrder(decodeURIComponent(id).toUpperCase()),
    getSettings(),
  ]);

  if (!order) notFound();

  const icon =
    order.status === "active" ? (
      <CheckCircle2 className="size-7 text-lime" />
    ) : order.status === "rejected" ? (
      <XCircle className="size-7 text-pink" />
    ) : (
      <Clock className="size-7 text-amber" />
    );

  const steps = [
    { key: "pending", label: "Order Created" },
    { key: "paid", label: "Payment Claimed" },
    { key: "active", label: "Access Granted" },
  ] as const;

  const stepIndex =
    order.status === "active"
      ? 2
      : order.status === "paid"
        ? 1
        : order.status === "rejected"
          ? -1
          : 0;

  return (
    <div className="mx-auto w-[min(100%-28px,520px)] py-10">
      <Link
        href="/order"
        className="glass-soft mb-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-display text-[10px] font-extrabold tracking-[1.3px] text-muted transition hover:border-accent hover:text-white"
      >
        <ArrowLeft className="size-3.5" /> TRACK ANOTHER
      </Link>

      <Card className="text-center">
        <div className="glass-soft mx-auto grid size-16 place-items-center rounded-2xl border border-line">
          {icon}
        </div>
        <code className="mt-4 block font-mono text-lg font-bold text-cyan">
          {order.id}
        </code>
        <div className="mt-2 flex justify-center">
          <Badge tone={STATUS_TONE[order.status]}>
            {STATUS_LABEL[order.status]}
          </Badge>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-muted">
          {STATUS_HELP[order.status]}
        </p>
      </Card>

      {/* Progress */}
      {order.status !== "rejected" ? (
        <Card className="mt-4">
          <p className="eyebrow">Progress</p>
          <ol className="mt-4 space-y-4">
            {steps.map((step, index) => {
              const done = index <= stepIndex;
              return (
                <li key={step.key} className="flex items-center gap-3">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full font-display text-[10px] font-extrabold transition ${
                      done
                        ? "grad-bg text-white"
                        : "border border-line text-faint"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={`text-[12.5px] font-semibold ${
                      done ? "text-ink" : "text-faint"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>
      ) : null}

      <Card className="mt-4">
        <p className="eyebrow">Order Details</p>
        <dl className="mt-4 space-y-3">
          <Row
            icon={<Package className="size-3.5" />}
            label="Pack"
            value={`${order.packName} · ${order.plan}`}
          />
          <Row
            icon={<IndianRupee className="size-3.5" />}
            label="Amount"
            value={formatINR(order.amount)}
          />
          <Row
            icon={<Clock className="size-3.5" />}
            label="Created"
            value={new Date(order.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
        </dl>
      </Card>

      <a
        href={`${settings.telegramSupport}?text=${encodeURIComponent(
          `Order ${order.id} ke baare mein poochna hai.`,
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-cyan/40 bg-cyan/12 px-5 py-3.5 font-display text-[12px] font-extrabold tracking-[1.3px] text-cyan transition hover:bg-cyan/20 active:scale-[0.98]"
      >
        <Send className="size-4" /> CONTACT SUPPORT
      </a>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/60 pb-3 last:border-0 last:pb-0">
      <dt className="flex items-center gap-2 text-[11.5px] text-faint">
        <span className="text-accent-soft">{icon}</span>
        {label}
      </dt>
      <dd className="text-right text-[12.5px] font-semibold">{value}</dd>
    </div>
  );
}
