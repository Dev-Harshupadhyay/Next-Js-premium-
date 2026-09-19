import Link from "next/link";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Smartphone,
  Globe2,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { TimelineChart } from "@/components/admin/Chart";
import { Badge } from "@/components/ui/Card";
import { computeStats } from "@/lib/stats";
import { listOrders } from "@/lib/db";
import { formatINR } from "@/lib/plans";
import { STATUS_TONE, STATUS_LABEL } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [stats, orders] = await Promise.all([computeStats(), listOrders()]);
  const recent = orders.slice(0, 6);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-cyan">Private Control Center</p>
        <h1 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
          Overview
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          Business snapshot · IST timezone · live server data
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Booked Revenue"
          value={formatINR(stats.revenue.total)}
          sub={`${formatINR(stats.revenue.active)} activated`}
          icon={<IndianRupee className="size-4" />}
          tone="lime"
        />
        <StatCard
          label="Total Orders"
          value={stats.orders.total}
          sub={`${stats.orders.today} aaj`}
          icon={<ShoppingCart className="size-4" />}
          tone="accent"
        />
        <StatCard
          label="Visitors"
          value={stats.visitors.total}
          sub={`${stats.visitors.today} aaj`}
          icon={<Users className="size-4" />}
          tone="cyan"
        />
        <StatCard
          label="Conversion"
          value={`${stats.conversionRate}%`}
          sub={`Avg order ${formatINR(stats.revenue.avgOrderValue)}`}
          icon={<TrendingUp className="size-4" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <TimelineChart timeline={stats.timeline} />

        <div className="space-y-3">
          <div className="glass rounded-2xl p-5">
            <p className="eyebrow">Order Pipeline</p>
            <div className="mt-4 space-y-2.5">
              <PipelineRow
                icon={<Clock className="size-3.5" />}
                label="Pending verification"
                value={stats.orders.pending}
                tone="amber"
              />
              <PipelineRow
                icon={<CheckCircle2 className="size-3.5" />}
                label="Active subscriptions"
                value={stats.orders.active}
                tone="lime"
              />
              <PipelineRow
                icon={<ShoppingCart className="size-3.5" />}
                label="Rejected"
                value={stats.orders.rejected}
                tone="pink"
              />
            </div>
            {stats.orders.pending > 0 ? (
              <Link
                href="/admin/orders?status=pending"
                className="grad-bg mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-display text-[11px] font-extrabold tracking-[1.2px] text-white transition hover:brightness-110"
              >
                REVIEW {stats.orders.pending} PENDING{" "}
                <ArrowRight className="size-3.5" />
              </Link>
            ) : null}
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="eyebrow">Audience</p>
            <div className="mt-4 space-y-2.5">
              <PipelineRow
                icon={<Smartphone className="size-3.5" />}
                label="Mobile visitors"
                value={stats.visitors.mobile}
                tone="accent"
              />
              <PipelineRow
                icon={<Globe2 className="size-3.5" />}
                label="Countries"
                value={stats.visitors.uniqueCountries}
                tone="cyan"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top packs */}
      {stats.topPacks.length ? (
        <div className="glass rounded-2xl p-5">
          <p className="eyebrow">Revenue by Pack</p>
          <div className="mt-4 space-y-3">
            {stats.topPacks.map((pack) => {
              const max = Math.max(...stats.topPacks.map((p) => p.revenue), 1);
              return (
                <div key={pack.pack}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold">{pack.pack}</span>
                    <span className="font-mono font-bold text-lime">
                      {formatINR(pack.revenue)}{" "}
                      <span className="text-faint">· {pack.count}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="grad-bg h-full rounded-full transition-all duration-700"
                      style={{ width: `${(pack.revenue / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Recent orders */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Recent Orders</p>
          <Link
            href="/admin/orders"
            className="text-[10.5px] font-bold text-accent-soft hover:underline"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-faint">
            Abhi koi order nahi. Pehla order aate hi yahan dikhega.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {recent.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders?q=${order.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white/[0.03] px-4 py-3 transition hover:border-accent/50 hover:bg-white/[0.06]"
              >
                <div className="min-w-0">
                  <code className="font-mono text-[12px] font-bold text-cyan">
                    {order.id}
                  </code>
                  <p className="mt-0.5 truncate text-[11px] text-muted">
                    {order.packName} · {order.plan}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <b className="font-mono text-[13px]">
                    {formatINR(order.amount)}
                  </b>
                  <Badge tone={STATUS_TONE[order.status]}>
                    {STATUS_LABEL[order.status]}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "accent" | "cyan" | "lime" | "pink" | "amber";
}) {
  const tones = {
    accent: "text-accent-soft",
    cyan: "text-cyan",
    lime: "text-lime",
    pink: "text-pink",
    amber: "text-amber",
  } as const;

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-[12px] text-muted">
        <span className={tones[tone]}>{icon}</span>
        {label}
      </span>
      <b className={`font-mono text-[15px] font-bold ${tones[tone]}`}>
        {value}
      </b>
    </div>
  );
}
