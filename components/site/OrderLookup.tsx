"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";

export function OrderLookup() {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function submit(event: FormEvent) {
    event.preventDefault();
    const id = value.trim().toUpperCase();
    if (!id) return;
    setBusy(true);
    router.push(`/order/${encodeURIComponent(id)}`);
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-6">
      <label htmlFor="order-id" className="eyebrow">
        Order ID
      </label>
      <input
        id="order-id"
        value={value}
        onChange={(event) => setValue(event.target.value.toUpperCase())}
        placeholder="TP-A7K2M9"
        autoComplete="off"
        className="mt-2 w-full rounded-2xl border border-line bg-white/[0.04] px-4 py-3.5 text-center font-mono text-lg font-bold tracking-[3px] text-white outline-none transition placeholder:text-faint focus:border-accent focus:bg-accent/[0.07]"
      />
      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="grad-bg mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-display text-[12px] font-extrabold tracking-[1.4px] text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Search className="size-4" />
        )}
        CHECK STATUS
      </button>
    </form>
  );
}
