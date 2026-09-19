import { NextResponse } from "next/server";
import { deleteOrder, getOrder, updateOrder } from "@/lib/db";
import { updateOrderSchema } from "@/lib/validation";
import { isAuthenticated } from "@/lib/auth";
import { notifyTelegram, escapeHTML, istTime } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Public: order status lookup (sirf safe fields). */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: order.id,
    packName: order.packName,
    plan: order.plan,
    amount: order.amount,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
}

/** Admin only: status change / note. */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const order = await updateOrder(id, parsed.data);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (parsed.data.status) {
    const emoji =
      parsed.data.status === "active"
        ? "✅"
        : parsed.data.status === "rejected"
          ? "❌"
          : parsed.data.status === "paid"
            ? "💰"
            : "⏳";
    void notifyTelegram(
      `${emoji} <b>ORDER UPDATED · ${escapeHTML(order.id)}</b>
📦 ${escapeHTML(order.packName)} · ${escapeHTML(order.plan)} · ₹${order.amount}
🔄 New status: <b>${escapeHTML(order.status.toUpperCase())}</b>
🇮🇳 ${escapeHTML(istTime())}`,
    );
  }

  return NextResponse.json({ order });
}

/** Admin only. */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const deleted = await deleteOrder(id);
  if (!deleted) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
