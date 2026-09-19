import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  featured = false,
}: {
  children: ReactNode;
  className?: string;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <div
        className={`relative rounded-3xl border border-transparent p-[1px] ${className}`}
        style={{
          background:
            "linear-gradient(var(--color-bg-soft),var(--color-bg-soft)) padding-box, linear-gradient(135deg,#8b5cf6,#22d3ee) border-box",
        }}
      >
        <div className="rounded-[23px] p-5 sm:p-6">{children}</div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-3xl p-5 sm:p-6 ${className}`}>{children}</div>
  );
}

export function SectionLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-4 mt-12 flex items-end justify-between gap-3 sm:mt-16">
      <h2 className="font-display text-[15px] font-extrabold tracking-[0.5px] sm:text-lg">
        {children}
      </h2>
      {hint ? <span className="eyebrow shrink-0">{hint}</span> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "accent",
  className = "",
}: {
  children: ReactNode;
  tone?: "accent" | "cyan" | "lime" | "pink" | "amber" | "muted";
  className?: string;
}) {
  const tones = {
    accent: "bg-accent/15 text-accent-soft border-accent/35",
    cyan: "bg-cyan/15 text-cyan border-cyan/35",
    lime: "bg-lime/15 text-lime border-lime/35",
    pink: "bg-pink/15 text-pink border-pink/35",
    amber: "bg-amber/15 text-amber border-amber/35",
    muted: "bg-white/5 text-muted border-line",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[1.4px] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
