"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Check,
  Copy,
  ArrowRight,
  Send,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { formatINR, MONTHS, savingsPercent } from "@/lib/plans";
import { buildUpiUrl } from "@/lib/upi";
import type { Pack, PlanDuration, PlanItem, Settings } from "@/lib/types";
import { RazorpayButton } from "./RazorpayButton";

type Step = 1 | 2;

export function CheckoutFlow({
  pack,
  settings,
  qrMap,
}: {
  pack: Pack;
  settings: Settings;
  qrMap: Record<PlanDuration, string>;
}) {
  const [step, setStep] = useState<Step>(1);
  const [selected, setSelected] = useState<PlanItem | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const upiUrl = useMemo(() => {
    if (!selected) return "";
    return buildUpiUrl({
      payeeAddress: settings.upiId,
      payeeName: settings.upiName,
      amount: selected.p,
      note: `Premium ${selected.n} - ${pack.name}`,
      transactionRef: orderId ?? undefined,
    });
  }, [selected, settings, pack.name, orderId]);

  async function proceed() {
    if (!selected) {
      toast("⚠️ Pehle ek plan select karo", "error");
      return;
    }
    setCreating(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: pack.id,
          plan: selected.n,
          method: "upi",
        }),
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (response.ok && data.id) {
        setOrderId(data.id);
        toast(`🧾 Order ${data.id} created`, "success");
      } else {
        toast("Order create nahi hua, phir bhi payment kar sakte ho", "error");
      }
    } catch {
      toast("Network issue — payment options phir bhi khul rahe hain", "error");
    } finally {
      setCreating(false);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function copyUpi() {
    navigator.clipboard
      .writeText(settings.upiId)
      .then(() => toast("✅ UPI ID copied!", "success"))
      .catch(() => toast("Copy nahi hua — manually select karo", "error"));
  }

  const telegramProofUrl = `${settings.telegramSupport}?text=${encodeURIComponent(
    `Payment done ✅\nOrder: ${orderId ?? "N/A"}\nPack: ${pack.name}\nPlan: ${
      selected?.n ?? "-"
    }\nAmount: ₹${selected?.p ?? 0}\n\nScreenshot bhej raha hoon.`,
  )}`;

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <StepDot active={step >= 1} done={step > 1} label="SELECT PLAN" />
        <div
          className={`h-[2px] flex-1 rounded-full transition-colors ${
            step > 1 ? "grad-bg" : "bg-line"
          }`}
        />
        <StepDot active={step >= 2} done={false} label="PAYMENT" />
      </div>

      {step === 1 ? (
        <Card>
          <div className="flex items-center gap-3">
            <span className="glass-soft grid size-11 place-items-center rounded-2xl border border-line text-xl">
              {pack.emoji}
            </span>
            <div>
              <p className="eyebrow">Choose your plan</p>
              <h1 className="font-display text-lg font-extrabold">
                {pack.name}
              </h1>
            </div>
          </div>

          <div className="mt-5 grid gap-2.5">
            {pack.items.map((item) => {
              const isActive = selected?.n === item.n;
              const save = savingsPercent(pack, item);
              return (
                <button
                  key={item.n}
                  type="button"
                  onClick={() => setSelected(item)}
                  aria-pressed={isActive}
                  className={`group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.99] ${
                    isActive
                      ? "border-accent bg-accent/12 shadow-[0_0_0_1px_rgba(139,92,246,.4)]"
                      : "border-line bg-white/[0.03] hover:border-line-hi hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border transition ${
                        isActive
                          ? "grad-bg border-transparent"
                          : "border-line-hi"
                      }`}
                    >
                      {isActive ? (
                        <Check className="size-3 text-white" strokeWidth={3.5} />
                      ) : null}
                    </span>
                    <div>
                      <p className="font-display text-[13.5px] font-extrabold">
                        {item.n}
                      </p>
                      <p className="text-[10.5px] text-faint">
                        ≈ ₹{Math.round(item.p / MONTHS[item.n])}/month
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {save > 0 ? <Badge tone="lime">SAVE {save}%</Badge> : null}
                    <b className="font-mono text-base font-bold">
                      {formatINR(item.p)}
                    </b>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={proceed}
            disabled={!selected || creating}
            className="grad-bg mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-4 font-display text-[13px] font-extrabold tracking-[1.5px] text-white shadow-[0_8px_26px_rgba(139,92,246,.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {creating ? (
              <>
                <Loader2 className="size-4 animate-spin" /> CREATING ORDER…
              </>
            ) : (
              <>
                PROCEED TO PAY <ArrowRight className="size-4" />
              </>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] text-faint">
            <ShieldCheck className="size-3.5" /> Secure UPI &amp; Razorpay ·
            Instant verification
          </p>
        </Card>
      ) : null}

      {step === 2 && selected ? (
        <>
          {/* Amount summary */}
          <Card className="text-center">
            <p className="eyebrow">Payment Amount</p>
            <div className="text-grad mt-1 font-display text-[42px] font-extrabold leading-none">
              {formatINR(selected.p)}
            </div>
            <p className="mt-2 text-[12.5px] text-muted">
              {pack.emoji} {pack.name} · {selected.n}
            </p>
            {orderId ? (
              <div className="glass-soft mt-4 inline-flex items-center gap-2 rounded-full border border-cyan/30 px-4 py-2">
                <span className="eyebrow text-cyan">Order ID</span>
                <code className="font-mono text-[13px] font-bold text-cyan">
                  {orderId}
                </code>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 block w-full cursor-pointer text-[11px] font-semibold text-faint underline-offset-4 transition hover:text-muted hover:underline"
            >
              ← Change plan
            </button>
          </Card>

          {/* UPI */}
          <Card className="shine relative overflow-hidden">
            <p className="eyebrow text-amber">⚡ Secure UPI Payment</p>

            <div className="mx-auto mt-4 w-40 overflow-hidden rounded-2xl border border-line bg-white p-2">
              <Image
                src={qrMap[selected.n] ?? ""}
                alt={`UPI QR for ${formatINR(selected.p)}`}
                width={300}
                height={300}
                unoptimized
                className="h-auto w-full"
              />
            </div>
            <p className="mt-2 text-center text-[10.5px] text-faint">
              Kisi bhi UPI app se scan karo
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-accent/55 bg-white/[0.02] px-4 py-3">
              <div className="min-w-0">
                <p className="eyebrow">Fampay / UPI ID</p>
                <p className="truncate font-mono text-[14.5px] font-bold text-white">
                  {settings.upiId}
                </p>
              </div>
              <button
                type="button"
                onClick={copyUpi}
                className="glass-soft flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3 py-2 font-display text-[10px] font-extrabold tracking-[1.2px] text-muted transition hover:border-accent hover:text-white active:scale-95"
              >
                <Copy className="size-3.5" /> COPY
              </button>
            </div>

            <a
              href={upiUrl}
              className="grad-bg mt-4 flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-display text-[13px] font-extrabold tracking-[1.4px] text-white shadow-[0_8px_26px_rgba(139,92,246,.35)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <Smartphone className="size-4" /> PAY {formatINR(selected.p)} VIA
              UPI
            </a>
            <p className="mt-2.5 text-center text-[10.5px] leading-relaxed text-faint">
              Button dabate hi selected amount ke saath UPI request open hogi.
              App chooser na aaye toh QR scan ya UPI ID use karo.
            </p>
          </Card>

          {/* Razorpay */}
          {selected.b ? (
            <Card>
              <p className="eyebrow text-cyan">Razorpay Checkout</p>
              <p className="mt-1.5 text-[12px] text-muted">
                Card, netbanking, wallet — sab options.
              </p>
              <div className="mt-3">
                <RazorpayButton buttonId={selected.b} />
              </div>
            </Card>
          ) : null}

          {/* Proof */}
          <Card>
            <h3 className="font-display text-[14px] font-extrabold">
              PAYMENT DONE? SEND PROOF
            </h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              Screenshot bhejo — verify karke turant access details de di
              jayengi.
              {orderId ? (
                <>
                  {" "}
                  Order ID <b className="text-cyan">{orderId}</b> zaroor
                  mention karo.
                </>
              ) : null}
            </p>

            <a
              href={telegramProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                orderId &&
                startTransition(() => {
                  void fetch(`/api/orders/${orderId}/claim`, {
                    method: "POST",
                  }).catch(() => {});
                })
              }
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-cyan/40 bg-cyan/12 px-5 py-3.5 font-display text-[12px] font-extrabold tracking-[1.3px] text-cyan transition hover:bg-cyan/20 active:scale-[0.98]"
            >
              <Send className="size-4" /> SEND SCREENSHOT ON TELEGRAM
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            </a>

            {orderId ? (
              <button
                type="button"
                onClick={() => router.push(`/order/${orderId}`)}
                className="glass-soft mt-2.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line px-5 py-3 font-display text-[11px] font-extrabold tracking-[1.3px] text-muted transition hover:border-accent hover:text-white"
              >
                TRACK MY ORDER <ArrowRight className="size-3.5" />
              </button>
            ) : null}
          </Card>

          {/* Universal link */}
          <Card>
            <p className="eyebrow">More Payment Options</p>
            <a
              href={settings.razorpayLink}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-soft mt-3 flex items-center justify-center gap-2 rounded-2xl border border-line px-5 py-3.5 font-display text-[11px] font-extrabold tracking-[1.2px] text-ink transition hover:border-accent hover:bg-accent/10 active:scale-[0.98]"
            >
              <ExternalLink className="size-4" /> PAY UNIVERSAL ·
              RAZORPAY.ME/@PMHARSH
            </a>
            <p className="mt-3 text-center text-[10.5px] text-faint">
              Issue aaye toh{" "}
              <a
                href={settings.telegramSupport}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-soft hover:underline"
              >
                Telegram · @pmharsh
              </a>{" "}
              ya{" "}
              <a
                href={`mailto:${settings.supportEmail}`}
                className="text-accent-soft hover:underline"
              >
                email
              </a>{" "}
              karo.
            </p>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid size-6 place-items-center rounded-full font-display text-[10px] font-extrabold transition ${
          active ? "grad-bg text-white" : "border border-line text-faint"
        }`}
      >
        {done ? <Check className="size-3" strokeWidth={3.5} /> : null}
        {!done && active ? "•" : null}
      </span>
      <span
        className={`font-display text-[9px] font-extrabold tracking-[1.3px] ${
          active ? "text-ink" : "text-faint"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
