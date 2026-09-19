import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createOrder, getSettings, listOrders } from "@/lib/db";
import { createOrderSchema } from "@/lib/validation";
import { findPlan, PACKS } from "@/lib/plans";
import { readRequestInfo } from "@/lib/request";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { notifyTelegram, escapeHTML, istTime } from "@/lib/telegram";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headerList = await headers();

  const limit = rateLimit(clientKey(headerList, "order"), 12, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Thoda ruk ke try karo." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const settings = await getSettings();
  if (settings.maintenance) {
    return NextResponse.json(
      { error: "Maintenance mode active — orders temporarily band hain." },
      { status: 503 },
    );
  }

  const { pack, plan, method, contact } = parsed.data;
  const planItem = findPlan(pack, plan);
  if (!planItem) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const info = readRequestInfo(headerList);

  // ⚠️ Price server se aata hai — client jo bheje use trust nahi karte.
  const order = await createOrder({
    pack,
    packName: PACKS[pack].name,
    plan,
    amount: planItem.p,
    method,
    contact,
    meta: {
      country: info.country,
      city: info.city,
      device: info.device,
      referer: info.referer,
    },
  });

  void notifyTelegram(
    `🧾 <b>NEW ORDER · ${escapeHTML(order.id)}</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Pack:</b> ${escapeHTML(order.packName)}
📅 <b>Plan:</b> ${escapeHTML(order.plan)}
💰 <b>Amount:</b> ₹${order.amount}
💳 <b>Method:</b> ${escapeHTML(order.method.toUpperCase())}

📍 <b>From:</b> ${escapeHTML([info.city, info.country].filter((v) => v && v !== "?").join(", ") || "Unknown")}
📱 <b>Device:</b> ${escapeHTML(info.device)} · ${escapeHTML(info.os)}
🌐 <b>IP:</b> <code>${escapeHTML(info.ip)}</code>

🇮🇳 <b>IST:</b> ${escapeHTML(istTime())}
━━━━━━━━━━━━━━━━━━━━
Status: <b>PENDING</b> — verify karke admin panel se approve karo.`,
  );

  return NextResponse.json(
    { id: order.id, amount: order.amount, status: order.status },
    { status: 201 },
  );
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await listOrders();
  return NextResponse.json({ orders });
}
