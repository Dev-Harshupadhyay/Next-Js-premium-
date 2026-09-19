"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { Settings } from "@/lib/types";

const FIELDS = [
  { key: "upiId", label: "UPI ID", placeholder: "pmharsh@fam" },
  { key: "upiName", label: "UPI Payee Name", placeholder: "TIMEPASS PREMIUM" },
  {
    key: "razorpayLink",
    label: "Razorpay Universal Link",
    placeholder: "https://razorpay.me/@pmharsh",
  },
  {
    key: "telegramChannel",
    label: "Telegram Channel",
    placeholder: "https://t.me/TIMEPASS_BACKUP_1",
  },
  {
    key: "telegramSupport",
    label: "Telegram Support DM",
    placeholder: "https://t.me/pmharsh",
  },
  {
    key: "supportEmail",
    label: "Support Email",
    placeholder: "pmharshu2035@gmail.com",
  },
] as const;

export function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState<Settings>(initial);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as {
        settings?: Settings;
        error?: string;
      };
      if (response.ok && data.settings) {
        setForm(data.settings);
        toast("✅ Settings saved", "success");
        router.refresh();
      } else {
        toast(data.error ?? "Save failed", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-5">
      <p className="eyebrow">Site Configuration</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="eyebrow">{field.label}</span>
            <input
              value={form[field.key]}
              onChange={(event) => update(field.key, event.target.value)}
              placeholder={field.placeholder}
              className="mt-1.5 w-full rounded-xl border border-line bg-white/[0.04] px-3.5 py-2.5 font-mono text-[12px] text-ink outline-none transition placeholder:text-faint focus:border-accent"
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="eyebrow">Announcement Banner</span>
        <input
          value={form.announcement}
          onChange={(event) => update("announcement", event.target.value)}
          placeholder="e.g. 🎉 Diwali offer — combo pack 20% off!"
          maxLength={300}
          className="mt-1.5 w-full rounded-xl border border-line bg-white/[0.04] px-3.5 py-2.5 text-[12.5px] text-ink outline-none transition placeholder:text-faint focus:border-accent"
        />
        <span className="mt-1.5 block text-[10px] text-faint">
          Khali chhodo to banner hide rahega. Har page ke top pe dikhega.
        </span>
      </label>

      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-4 py-3">
        <input
          type="checkbox"
          checked={form.maintenance}
          onChange={(event) => update("maintenance", event.target.checked)}
          className="size-4 accent-[#8b5cf6]"
        />
        <span>
          <span className="block font-display text-[12px] font-bold">
            Maintenance Mode
          </span>
          <span className="block text-[10.5px] text-faint">
            On karne pe checkout disable ho jayega (admin panel chalta rahega).
          </span>
        </span>
      </label>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
        <button
          type="submit"
          disabled={busy}
          className="grad-bg flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 font-display text-[11px] font-extrabold tracking-[1.3px] text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          SAVE SETTINGS
        </button>
        <button
          type="button"
          onClick={() => setForm(initial)}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white/[0.04] px-4 py-2.5 font-display text-[11px] font-extrabold tracking-[1.3px] text-muted transition hover:text-white"
        >
          <RotateCcw className="size-3.5" /> RESET
        </button>
      </div>
    </form>
  );
}
