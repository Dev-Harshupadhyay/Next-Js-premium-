"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Info, Send, Code2, X, Mail, Github, Globe } from "lucide-react";
import { SITE } from "@/lib/config";
import type { Settings } from "@/lib/types";

export function Header({ settings }: { settings: Settings }) {
  const [drawer, setDrawer] = useState(false);
  const [info, setInfo] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-[900] flex items-center justify-between gap-2 border-b border-line bg-bg/75 px-3 py-2.5 backdrop-blur-xl backdrop-saturate-150 sm:px-4 sm:py-3">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
          <span className="grad-bg grid size-7 place-items-center rounded-[9px] text-white shadow-[0_0_16px_rgba(139,92,246,.55)] sm:size-[30px]">
            <Zap className="size-3.5 animate-(--animate-pulse-soft)" strokeWidth={2.6} />
          </span>
          <span className="text-grad font-display text-[13px] font-extrabold tracking-[1.6px] sm:text-[15px] sm:tracking-[2.5px]">
            TIMEPASS
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setInfo(true)}
            className="glass-soft cursor-pointer rounded-full border border-line-hi px-3 py-2 font-display text-[9px] font-extrabold tracking-[1.2px] text-white transition hover:border-accent hover:bg-accent/15 active:scale-95 sm:px-4 sm:text-[10.5px] sm:tracking-[1.5px]"
          >
            INFO
          </button>
          <a
            href={settings.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram channel"
            className="glass-soft grid size-8 place-items-center rounded-full border border-line text-muted transition hover:border-accent hover:text-white active:scale-90 sm:size-[34px]"
          >
            <Send className="size-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Developer info"
            className="glass-soft grid size-8 place-items-center rounded-full border border-line text-muted transition hover:border-accent hover:text-white active:scale-90 sm:size-[34px]"
          >
            <Code2 className="size-3.5" />
          </button>
        </div>
      </header>

      {/* ── Dev drawer ── */}
      <div
        onClick={() => setDrawer(false)}
        className={`fixed inset-0 z-[1400] bg-black/65 backdrop-blur-sm transition-opacity duration-300 ${
          drawer ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-hidden={!drawer}
        className={`fixed right-0 top-0 z-[1500] h-dvh w-[min(84vw,330px)] overflow-y-auto border-l border-line bg-bg-soft/95 p-5 backdrop-blur-2xl transition-transform duration-300 ease-out ${
          drawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setDrawer(false)}
          aria-label="Close"
          className="glass-soft mb-6 grid size-8 place-items-center rounded-full border border-line text-muted transition hover:text-white"
        >
          <X className="size-4" />
        </button>

        <p className="eyebrow">Developer</p>
        <h3 className="mt-1 font-display text-lg font-extrabold">
          MADE BY <span className="text-grad">HARSH DEV</span>
        </h3>
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
          Full-stack developer. Ye site Next.js 15 + React 19 + TypeScript pe
          bani hai — server components, server-side analytics aur secure admin
          panel ke saath.
        </p>

        <div className="mt-6 space-y-2">
          <DrawerLink href={SITE.authorUrl} icon={<Globe className="size-4" />}>
            Portfolio
          </DrawerLink>
          <DrawerLink
            href={settings.telegramSupport}
            icon={<Send className="size-4" />}
          >
            Telegram · @pmharsh
          </DrawerLink>
          <DrawerLink
            href="https://github.com/Dev-Harshupadhyay"
            icon={<Github className="size-4" />}
          >
            GitHub
          </DrawerLink>
          <DrawerLink
            href={`mailto:${settings.supportEmail}`}
            icon={<Mail className="size-4" />}
          >
            Email
          </DrawerLink>
        </div>

        <p className="mt-8 text-[10px] leading-relaxed text-faint">
          Built with Next.js App Router · Tailwind CSS v4 · Zod · JOSE
        </p>
      </aside>

      {/* ── Info modal ── */}
      {info ? (
        <div
          className="fixed inset-0 z-[1600] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setInfo(false)}
        >
          <div
            className="glass max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-3xl p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-cyan">About</p>
                <h2 className="mt-1 font-display text-lg font-extrabold">
                  Timepass Premium Info
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInfo(false)}
                aria-label="Close"
                className="glass-soft grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <ul className="mt-5 space-y-3 text-[12.5px] leading-relaxed text-muted">
              <li className="flex gap-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  Market se sasta OTT — Movies, Web Series, Adult aur Combo
                  plans instant activation ke saath.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-cyan" />
                <span>
                  Payment UPI, Razorpay button ya Razorpay.me universal link se
                  ho sakta hai.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-pink" />
                <span>
                  Payment ke baad order ID save kar lo aur screenshot Telegram
                  pe bhejo — verification ke turant baad access mil jayega.
                </span>
              </li>
            </ul>

            <div className="mt-6 grid gap-2">
              <a
                href={settings.telegramSupport}
                target="_blank"
                rel="noopener noreferrer"
                className="grad-bg flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-display text-[12px] font-extrabold tracking-[1.4px] text-white"
              >
                <Send className="size-4" /> CONTACT SUPPORT
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DrawerLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-soft flex items-center gap-3 rounded-2xl border border-line px-4 py-3 text-[12.5px] font-semibold text-ink transition hover:border-accent hover:bg-accent/10 active:scale-[0.98]"
    >
      <span className="text-accent">{icon}</span>
      {children}
    </a>
  );
}
