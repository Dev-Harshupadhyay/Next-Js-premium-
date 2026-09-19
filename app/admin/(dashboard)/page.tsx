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
  ShoppingBag,
  Inbox,
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
  const hasData = orders.length > 0 || stats.visitors.total > 0;

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

      {/* ── Headline: kitne logo ne purchase kiya ── */}
      <div className="glass relative overflow-hidden rounded-3xl p-6 text-center sm:p-8">
        <div
          aria-hidden
          className="grad-bg pointer-events-none absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        />
        <div className="relative">
          <p className="eyebrow text-accent-soft">
            Kitne Logo Ne Purchase Kiya
          </p>
          <p className="text-grad mt-2 font-display text-6xl font-extrabold leading-none sm:text-7xl">
            {stats.buyers.total}
          </p>
          <p className="mt-2.5 text-[12.5px] text-muted">
            {stats.buyers.total === 0
              ? "Abhi tak koi purchase nahi hua"
              : `${stats.buyers.total} customer${stats.buyers.total === 1 ? "" : "s"} ne paisa bheja hai`}
          </p>

          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 border-t border-line pt-5">
            <MiniStat label="Aaj" value={stats.buyers.today} tone="lime" />
            <MiniStat
              label="Is Mahine"
              value={stats.buyers.thisMonth}
              tone="accent"
            />
            <MiniStat
              label="Pending"
              value={stats.orders.pending}
              tone="amber"
            />
          </div>

          {stats.orders.pending > 0 ? (
            <Link
              href="/admin/orders?status=pending"
              className="grad-bg mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-display text-[11.5px] font-extrabold tracking-[1.3px] text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              REVIEW {stats.orders.pending} PENDING{" "}
              <ArrowRight className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      {!hasData ? (
        <div className="glass rounded-2xl px-6 py-14 text-center">
          <Inbox className="mx-auto size-9 text-faint" />
          <p className="mt-4 font-display text-[14px] font-extrabold">
            Dashboard abhi khaali hai
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-faint">
            Koi bhi fake ya demo data nahi hai — sirf real customers dikhenge.
            Jaise hi koi site pe aayega ya plan kharidega, sab kuch yahan
            real-time update hoga.
          </p>
          <Link
            href="/"
            target="_blank"
            className="glass-soft mt-5 inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 font-display text-[10.5px] font-extrabold tracking-[1.2px] text-muted transition hover:border-accent hover:text-white"
          >
            OPEN LIVE SITE <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Booked Revenue"
          value={formatINR(stats.revenue.total)}
          sub={`${formatINR(stats.revenue.active)} activated`}
          icon={<IndianRupee className="size-4" />}
          tone="lime"
        />
        <StatCard
          label="Paying Customers"
          value={stats.buyers.total}
          sub={`${stats.orders.total} total orders`}
          icon={<ShoppingBag className="size-4" />}
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
            Abhi koi order nahi — pehla real order aate hi yahan dikhega.
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

function MiniStat({
  label,
  value,
  tone,
}: {
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
    <div>
      <p className={`font-display text-2xl font-extrabold ${tones[tone]}`}>
        {value}
      </p>
      <p className="eyebrow mt-1">{label}</p>
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
