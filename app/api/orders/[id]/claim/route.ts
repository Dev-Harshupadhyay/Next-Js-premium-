import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getOrder, updateOrder } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { notifyTelegram, escapeHTML, istTime } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * User "screenshot bhej diya" bolta hai → order pending se paid.
 * Sirf pending → paid allowed hai, isliye koi self-approve nahi kar sakta.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headerList = await headers();
  const limit = rateLimit(clientKey(headerList, "claim"), 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const existing = await getOrder(id);
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (existing.status !== "pending") {
    return NextResponse.json({ ok: true, status: existing.status });
  }

  const order = await updateOrder(id, { status: "paid" });

  void notifyTelegram(
    `💰 <b>PAYMENT CLAIMED · ${escapeHTML(id)}</b>
📦 ${escapeHTML(existing.packName)} · ${escapeHTML(existing.plan)} · ₹${existing.amount}
📸 User ne screenshot bhejne ka claim kiya hai.
⚠️ <b>Verify karke admin panel se APPROVE karo.</b>
🇮🇳 ${escapeHTML(istTime())}`,
  );

  return NextResponse.json({ ok: true, status: order?.status ?? "paid" });
}
