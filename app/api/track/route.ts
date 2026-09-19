import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { addVisitor } from "@/lib/db";
import { trackSchema } from "@/lib/validation";
import { readRequestInfo } from "@/lib/request";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { notifyTelegram, escapeHTML, istTime } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headerList = await headers();

  const limit = rateLimit(clientKey(headerList, "track"), 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    /* defaults below */
  }

  const parsed = trackSchema.safeParse(body);
  const client = parsed.success ? parsed.data : trackSchema.parse({});
  const info = readRequestInfo(headerList);
  const now = new Date();

  const log = await addVisitor({
    time: now.toISOString(),
    ip: info.ip,
    country: info.country,
    region: info.region,
    city: info.city,
    device: info.device,
    browser: info.browser,
    os: info.os,
    screen: client.screen,
    lang: client.lang,
    tz: client.tz,
    path: client.path,
    referer: info.referer,
  });

  // Landing page visits hi notify karo — har route pe spam nahi.
  if (client.path === "/") {
    void notifyTelegram(
      `⚡ <b>TIMEPASS PREMIUM · NEW VISITOR</b>
━━━━━━━━━━━━━━━━━━━━
📍 <b>LOCATION &amp; NETWORK</b>
├ <b>IP:</b> <code>${escapeHTML(info.ip)}</code>
└ <b>Location:</b> ${escapeHTML([info.city, info.region, info.country].filter((v) => v && v !== "?").join(", ") || "Unknown")}

📱 <b>DEVICE DETAILS</b>
├ <b>Device:</b> ${escapeHTML(info.device)}
├ <b>OS:</b> ${escapeHTML(info.os)}
├ <b>Browser:</b> ${escapeHTML(info.browser)}
├ <b>Screen:</b> ${escapeHTML(client.screen)}
├ <b>Timezone:</b> ${escapeHTML(client.tz)}
└ <b>Language:</b> ${escapeHTML(client.lang)}

🔗 <b>Referer:</b> ${escapeHTML(info.referer)}
🇮🇳 <b>IST:</b> ${escapeHTML(istTime(now))}
━━━━━━━━━━━━━━━━━━━━`,
    );
  }

  return NextResponse.json({ ok: true, id: log.id });
}
