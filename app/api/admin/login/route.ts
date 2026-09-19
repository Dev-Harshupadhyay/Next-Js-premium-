import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { loginSchema } from "@/lib/validation";
import { createSessionToken, safeEqual } from "@/lib/auth";
import { ADMIN_COOKIE, SESSION_TTL_SECONDS } from "@/lib/config";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { notifyTelegram, escapeHTML, istTime } from "@/lib/telegram";
import { readRequestInfo } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headerList = await headers();

  // 6 attempts / 5 min — brute force ke against
  const limit = rateLimit(clientKey(headerList, "admin-login"), 6, 300_000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: `Bahut zyada attempts. ${limit.retryAfter}s baad try karo.`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD env variable set nahi hai." },
      { status: 500 },
    );
  }

  if (!safeEqual(parsed.data.password, expected)) {
    const info = readRequestInfo(headerList);
    void notifyTelegram(
      `🚨 <b>FAILED ADMIN LOGIN</b>
🌐 IP: <code>${escapeHTML(info.ip)}</code>
📍 ${escapeHTML([info.city, info.country].filter((v) => v && v !== "?").join(", ") || "Unknown")}
📱 ${escapeHTML(info.device)} · ${escapeHTML(info.browser)}
🇮🇳 ${escapeHTML(istTime())}`,
    );
    return NextResponse.json(
      { error: "Invalid admin credentials." },
      { status: 401 },
    );
  }

  const token = await createSessionToken();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  const info = readRequestInfo(headerList);
  void notifyTelegram(
    `🔓 <b>ADMIN LOGIN</b>
🌐 IP: <code>${escapeHTML(info.ip)}</code>
📱 ${escapeHTML(info.device)} · ${escapeHTML(info.browser)} · ${escapeHTML(info.os)}
🇮🇳 ${escapeHTML(istTime())}`,
  );

  return NextResponse.json({ ok: true });
}
