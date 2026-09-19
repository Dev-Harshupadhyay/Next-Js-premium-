import { Users, Smartphone, Monitor, Globe2 } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { VisitorsTable } from "@/components/admin/VisitorsTable";
import { listVisitors } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage() {
  const visitors = await listVisitors();

  const mobile = visitors.filter((v) => v.device.includes("Mobile")).length;
  const desktop = visitors.filter((v) => v.device.includes("Desktop")).length;
  const countries = new Set(
    visitors.map((v) => v.country).filter((c) => c && c !== "?"),
  ).size;

  const byCountry = Object.entries(
    visitors.reduce<Record<string, number>>((acc, visitor) => {
      const key = visitor.country && visitor.country !== "?" ? visitor.country : "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-cyan">Server-side Analytics</p>
        <h1 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
          Visitors
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          Geo/device request headers se — adblock-proof, koi 3rd party API nahi
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Visits"
          value={visitors.length}
          icon={<Users className="size-4" />}
          tone="accent"
        />
        <StatCard
          label="Mobile"
          value={mobile}
          sub={
            visitors.length
              ? `${Math.round((mobile / visitors.length) * 100)}% of traffic`
              : undefined
          }
          icon={<Smartphone className="size-4" />}
          tone="cyan"
        />
        <StatCard
          label="Desktop"
          value={desktop}
          icon={<Monitor className="size-4" />}
          tone="lime"
        />
        <StatCard
          label="Countries"
          value={countries}
          icon={<Globe2 className="size-4" />}
          tone="amber"
        />
      </div>

      {byCountry.length ? (
        <div className="glass rounded-2xl p-5">
          <p className="eyebrow">Top Locations</p>
          <div className="mt-4 space-y-3">
            {byCountry.map(([country, count]) => (
              <div key={country}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold">{country}</span>
                  <span className="font-mono font-bold text-cyan">{count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-cyan/50 transition-all duration-700"
                    style={{
                      width: `${(count / (byCountry[0]?.[1] ?? 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <VisitorsTable initialVisitors={visitors} />
    </div>
  );
}
