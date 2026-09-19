"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Send, X, Download } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const DISMISS_KEY = "tp_tg_gate_v2";

export function TelegramGate({
  channelUrl,
  qrDataUrl,
}: {
  channelUrl: string;
  qrDataUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-locked", open);
    return () => document.body.classList.remove("is-locked");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    setOpen(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  function saveQr() {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "timepass-telegram-qr.png";
    link.click();
    toast("📥 QR saved", "success");
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Join Telegram channel"
      className="fixed inset-0 z-[1800] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="glass animate-(--animate-rise) relative max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-3xl p-6 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="glass-soft absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-line text-muted transition hover:text-white"
        >
          <X className="size-4" />
        </button>

        <p className="eyebrow text-accent-soft">● Timepass Premium Notice</p>
        <h2 className="mt-2 font-display text-[17px] font-extrabold leading-snug">
          Join Our Official
          <br />
          Telegram Channel
        </h2>

        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="grad-bg mt-5 flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-display text-[12px] font-extrabold tracking-[1.4px] text-white shadow-[0_8px_26px_rgba(139,92,246,.4)] transition hover:brightness-110 active:scale-[0.98]"
        >
          <Send className="size-4" /> JOIN TELEGRAM CHANNEL
        </a>

        <p className="eyebrow mt-6">Official QR Code</p>
        <div className="mx-auto mt-3 w-44 overflow-hidden rounded-2xl border border-line bg-white p-2">
          <Image
            src={qrDataUrl}
            alt="Telegram channel QR code"
            width={320}
            height={320}
            unoptimized
            className="h-auto w-full"
          />
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
          Scan ya save karke seedha official channel join karo.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={saveQr}
            className="glass-soft flex items-center justify-center gap-1.5 rounded-xl border border-line px-3 py-2.5 font-display text-[10px] font-extrabold tracking-[1.2px] text-muted transition hover:border-accent hover:text-white"
          >
            <Download className="size-3.5" /> SAVE QR
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="glass-soft rounded-xl border border-line px-3 py-2.5 font-display text-[10px] font-extrabold tracking-[1.2px] text-muted transition hover:border-pink hover:text-pink"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
