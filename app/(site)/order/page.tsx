import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { OrderLookup } from "@/components/site/OrderLookup";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Apna order ID daal ke subscription status check karo.",
};

export default function OrderLookupPage() {
  return (
    <div className="mx-auto w-[min(100%-28px,520px)] py-12">
      <div className="text-center">
        <div className="grad-bg mx-auto grid size-14 place-items-center rounded-2xl shadow-[0_0_28px_rgba(139,92,246,.4)]">
          <Receipt className="size-6 text-white" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold">
          Track Your Order
        </h1>
        <p className="mt-2 text-[12.5px] text-muted">
          Payment ke baad mila order ID daalo — status turant dikh jayega.
        </p>
      </div>

      <div className="mt-8">
        <OrderLookup />
      </div>
    </div>
  );
}
