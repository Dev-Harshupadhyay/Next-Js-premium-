"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Tags,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Zap,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/visitors", label: "Visitors", icon: Users },
  { href: "/admin/plans", label: "Plans", icon: Tags },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AdminShell({
  children,
  persistent,
  storage,
}: {
  children: ReactNode;
  persistent: boolean;
  storage: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="relative z-10 flex min-h-dvh">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-[1200] flex w-64 shrink-0 flex-col border-r border-line bg-bg-soft/95 backdrop-blur-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grad-bg grid size-8 place-items-center rounded-[10px] text-white">
              <Zap className="size-4" strokeWidth={2.6} />
            </span>
            <div>
              <p className="text-grad font-display text-[13px] font-extrabold tracking-[1.6px]">
                TIMEPASS
              </p>
              <p className="text-[8.5px] font-extrabold tracking-[1.8px] text-faint">
                ADMIN PANEL
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid size-8 place-items-center rounded-full border border-line text-muted lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-display text-[12px] font-bold tracking-[0.6px] transition ${
                  active
                    ? "bg-accent/15 text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,.35)]"
                    : "text-muted hover:bg-white/5 hover:text-ink"
                }`}
              >
                <Icon
                  className={`size-4 ${active ? "text-accent-soft" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-line p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-display text-[11px] font-bold text-faint transition hover:bg-white/5 hover:text-muted"
          >
            <ExternalLink className="size-3.5" /> View live site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 font-display text-[11px] font-bold text-pink/80 transition hover:bg-pink/10 hover:text-pink"
          >
            <LogOut className="size-3.5" /> Logout
          </button>
        </div>
      </aside>

      {open ? (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      {/* ── Content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[900] flex items-center gap-3 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="glass-soft grid size-9 place-items-center rounded-xl border border-line text-muted"
          >
            <Menu className="size-4" />
          </button>
          <span className="text-grad font-display text-[13px] font-extrabold tracking-[1.6px]">
            TIMEPASS ADMIN
          </span>
        </header>

        {!persistent ? (
          <div className="flex items-start gap-2.5 border-b border-amber/25 bg-amber/10 px-4 py-2.5 text-[11px] leading-relaxed text-amber sm:px-6">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>
              <b>Ephemeral storage ({storage}):</b> data sirf memory me hai aur
              cold start pe reset ho jayega. Permanent karne ke liye Vercel me{" "}
              <code className="font-mono">UPSTASH_REDIS_REST_URL</code> +{" "}
              <code className="font-mono">UPSTASH_REDIS_REST_TOKEN</code> add
              karo — code change nahi karna.
            </span>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
