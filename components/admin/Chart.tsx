import type { AdminStats } from "@/lib/types";
import { formatINR } from "@/lib/plans";

/**
 * Dependency-free SVG bar chart — koi charting library nahi,
 * server component hai to client bundle me kuch nahi jata.
 */
export function TimelineChart({
  timeline,
}: {
  timeline: AdminStats["timeline"];
}) {
  const maxRevenue = Math.max(1, ...timeline.map((day) => day.revenue));
  const maxVisitors = Math.max(1, ...timeline.map((day) => day.visitors));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Last 7 Days</p>
          <h3 className="mt-0.5 font-display text-[14px] font-extrabold">
            Revenue &amp; Traffic
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-faint">
          <span className="flex items-center gap-1.5">
            <span className="grad-bg size-2.5 rounded-sm" /> REVENUE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-cyan/40" /> VISITORS
          </span>
        </div>
      </div>

      <div className="mt-6 flex h-40 items-end gap-2 sm:gap-3">
        {timeline.map((day) => {
          const revenueH = Math.round((day.revenue / maxRevenue) * 100);
          const visitorH = Math.round((day.visitors / maxVisitors) * 100);
          return (
            <div
              key={day.date}
              className="group flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <div className="relative flex h-full w-full items-end justify-center gap-1">
                <div
                  className="grad-bg w-1/2 rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(revenueH, day.revenue ? 4 : 1)}%` }}
                  title={`${formatINR(day.revenue)} · ${day.orders} orders`}
                />
                <div
                  className="w-1/2 rounded-t-md bg-cyan/35 transition-all duration-500"
                  style={{
                    height: `${Math.max(visitorH, day.visitors ? 4 : 1)}%`,
                  }}
                  title={`${day.visitors} visitors`}
                />
              </div>
              <span className="text-[9.5px] font-bold text-faint">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
        <div>
          <p className="font-mono text-[15px] font-bold text-lime">
            {formatINR(timeline.reduce((total, day) => total + day.revenue, 0))}
          </p>
          <p className="eyebrow mt-0.5">7d Revenue</p>
        </div>
        <div>
          <p className="font-mono text-[15px] font-bold text-accent-soft">
            {timeline.reduce((total, day) => total + day.orders, 0)}
          </p>
          <p className="eyebrow mt-0.5">7d Orders</p>
        </div>
        <div>
          <p className="font-mono text-[15px] font-bold text-cyan">
            {timeline.reduce((total, day) => total + day.visitors, 0)}
          </p>
          <p className="eyebrow mt-0.5">7d Visitors</p>
        </div>
      </div>
    </div>
  );
}
