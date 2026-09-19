import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "accent",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  tone?: "accent" | "cyan" | "lime" | "pink" | "amber";
}) {
  const tones = {
    accent: "text-accent-soft bg-accent/12 border-accent/25",
    cyan: "text-cyan bg-cyan/12 border-cyan/25",
    lime: "text-lime bg-lime/12 border-lime/25",
    pink: "text-pink bg-pink/12 border-pink/25",
    amber: "text-amber bg-amber/12 border-amber/25",
  } as const;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow leading-snug">{label}</p>
        {icon ? (
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-xl border ${tones[tone]}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold leading-none">
        {value}
      </p>
      {sub ? <p className="mt-1.5 text-[10.5px] text-faint">{sub}</p> : null}
    </div>
  );
}
