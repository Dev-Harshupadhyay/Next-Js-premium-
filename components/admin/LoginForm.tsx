"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { KeyRound, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function LoginForm({ next }: { next?: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!password) {
      setError("Enter admin password.");
      return;
    }
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };

      if (response.ok) {
        router.replace(next && next.startsWith("/admin") ? next : "/admin");
        router.refresh();
        return;
      }
      setError(data.error ?? "Invalid admin credentials.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass w-full max-w-sm rounded-3xl p-7">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-faint transition hover:text-muted"
      >
        <ArrowLeft className="size-3" /> Back to site
      </Link>

      <div className="text-center">
        <div className="grad-bg mx-auto grid size-14 place-items-center rounded-2xl shadow-[0_0_28px_rgba(139,92,246,.45)]">
          <KeyRound className="size-6 text-white" />
        </div>
        <p className="eyebrow mt-4 text-cyan">Private Control Center</p>
        <h1 className="mt-1 font-display text-xl font-extrabold">
          TIMEPASS ADMIN
        </h1>
        <p className="eyebrow mt-2">Restricted Access</p>
      </div>

      <form onSubmit={submit} className="mt-7">
        <label htmlFor="admin-password" className="sr-only">
          Admin password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          autoFocus
          className="w-full rounded-2xl border border-line bg-white/[0.04] px-4 py-3.5 text-center font-mono text-lg tracking-[6px] text-white outline-none transition placeholder:tracking-[4px] placeholder:text-faint focus:border-accent focus:bg-accent/[0.07]"
        />

        {error ? (
          <p
            role="alert"
            className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11.5px] font-semibold text-pink"
          >
            <ShieldAlert className="size-3.5 shrink-0" /> {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="grad-bg mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-display text-[12px] font-extrabold tracking-[1.5px] text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" /> VERIFYING…
            </>
          ) : (
            "UNLOCK ADMIN PANEL"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[9.5px] leading-relaxed text-faint">
        Password server-side environment variable (<code>ADMIN_PASSWORD</code>)
        me stored hai.
        <br />
        Session ek httpOnly signed cookie hai — 8 ghante valid.
      </p>
    </div>
  );
}
