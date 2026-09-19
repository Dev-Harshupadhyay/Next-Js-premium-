import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "soft" | "danger" | "pill";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-display font-extrabold tracking-[1.5px] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "grad-bg text-white rounded-2xl shadow-[0_8px_26px_rgba(139,92,246,.35)] hover:shadow-[0_10px_34px_rgba(139,92,246,.5)] hover:brightness-110",
  ghost:
    "glass-soft text-ink rounded-2xl border border-line-hi hover:border-accent hover:bg-accent/15",
  soft: "bg-white/[0.045] text-muted rounded-xl border border-line hover:text-ink hover:border-accent/60",
  danger:
    "bg-pink/15 text-pink rounded-xl border border-pink/35 hover:bg-pink/25",
  pill: "glass-soft text-white rounded-full border border-line-hi hover:border-accent hover:bg-accent/15",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-[10px]",
  md: "px-4 py-2.5 text-[11.5px]",
  lg: "px-5 py-3.5 text-[13px]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  href,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function BeamButton({
  children,
  className = "",
  ...rest
}: ComponentProps<"button">) {
  return (
    <button type="button" className={`beam-btn ${className}`} {...rest}>
      <span>{children}</span>
    </button>
  );
}

export function BeamLink({
  children,
  href,
  className = "",
  ...rest
}: ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={`beam-btn ${className}`} {...rest}>
      <span>{children}</span>
    </Link>
  );
}
