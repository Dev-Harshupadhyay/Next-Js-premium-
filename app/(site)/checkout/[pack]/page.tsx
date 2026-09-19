import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckoutFlow } from "@/components/site/CheckoutFlow";
import { VisitTracker } from "@/components/site/VisitTracker";
import { getPack, isPackId } from "@/lib/plans";
import { getSettings } from "@/lib/db";
import { qrDataUrl } from "@/lib/qr";
import { buildUpiUrl } from "@/lib/upi";
import type { PlanDuration } from "@/lib/types";

export async function generateStaticParams() {
  return [{ pack: "movies" }, { pack: "adult" }, { pack: "combo" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pack: string }>;
}): Promise<Metadata> {
  const { pack: packId } = await params;
  const pack = getPack(packId);
  if (!pack) return { title: "Checkout" };
  return {
    title: `${pack.name} — Checkout`,
    description: `${pack.name} (${pack.tagline}) — plan select karke instant UPI ya Razorpay se payment karo.`,
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ pack: string }>;
}) {
  const { pack: packId } = await params;
  if (!isPackId(packId)) notFound();

  const pack = getPack(packId);
  if (!pack) notFound();

  const settings = await getSettings();

  if (settings.maintenance) {
    return (
      <div className="mx-auto w-[min(100%-28px,520px)] py-20 text-center">
        <p className="text-5xl">🛠️</p>
        <h1 className="mt-4 font-display text-xl font-extrabold">
          Checkout temporarily band hai
        </h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
          Maintenance chal raha hai. Thodi der baad try karo ya seedha Telegram
          pe order kar lo.
        </p>
        <a
          href={settings.telegramSupport}
          target="_blank"
          rel="noopener noreferrer"
          className="grad-bg mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-display text-[12px] font-extrabold tracking-[1.4px] text-white transition hover:brightness-110"
        >
          CONTACT ON TELEGRAM
        </a>
      </div>
    );
  }

  // Pre-render a QR for every plan so switching duration is instant (no re-fetch).
  const qrMap: Record<string, string> = {};
  await Promise.all(
    pack.items.map(async (item) => {
      const url = buildUpiUrl({
        payeeAddress: settings.upiId,
        payeeName: settings.upiName,
        amount: item.p,
        note: `Premium ${item.n} - ${pack.name}`,
      });
      qrMap[item.n] = await qrDataUrl(url, 300);
    }),
  );

  return (
    <>
      <VisitTracker path={`/checkout/${packId}`} />

      <div className="mx-auto w-[min(100%-28px,620px)] pb-16 pt-6">
        <Link
          href="/#plans"
          className="glass-soft mb-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-display text-[10px] font-extrabold tracking-[1.3px] text-muted transition hover:border-accent hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> BACK TO PLANS
        </Link>

        <CheckoutFlow
          pack={pack}
          settings={settings}
          qrMap={qrMap as Record<PlanDuration, string>}
        />
      </div>
    </>
  );
}
