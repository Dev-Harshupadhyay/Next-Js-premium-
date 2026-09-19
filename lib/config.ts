import type { Settings } from "./types";

const FALLBACK_SITE_URL = "https://verceel-timepass.vercel.app";

/**
 * Site ka base URL nikalta hai — build kabhi crash nahi hona chahiye.
 *
 * Kyun zaroori hai: `process.env.X ?? fallback` sirf `undefined` pe fallback
 * karta hai. Agar Vercel pe variable bana diya par value khaali chhod di, toh
 * `""` aata hai — aur `new URL("")` build ko `ERR_INVALID_URL` se giraa deta hai.
 *
 * Isliye: trim karo, khaali ho toh chhod do, galat ho toh chhod do,
 * protocol na ho toh https:// laga do, aur last me hamesha ek valid URL do.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    // Vercel khud ye set karta hai — production domain (bina protocol ke)
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    // Preview/branch deployments ke liye
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
  ];

  for (const raw of candidates) {
    if (typeof raw !== "string") continue;

    const trimmed = raw.trim().replace(/\/+$/, "");
    if (!trimmed) continue; // khaali ya sirf spaces

    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    try {
      const parsed = new URL(withProtocol);
      if (parsed.hostname) return parsed.origin;
    } catch {
      // galat value — agle candidate pe jao
    }
  }

  return FALLBACK_SITE_URL;
}

/**
 * Site-wide constants, ported from the original index.html CONFIG block.
 * Env vars can override without a code change.
 */
export const SITE = {
  name: "Timepass Premium",
  shortName: "TIMEPASS",
  tagline: "Market Se Sasta OTT 🔥",
  description:
    "TIMEPASS PREMIUM — Market se sasta OTT. Movies & Web Series, Adult aur Combo plans. Instant UPI payment aur fast verification.",
  url: resolveSiteUrl(),
  heroImage: "https://i.ibb.co/7xC7jC8y/your-image.jpg",
  author: "HARSH DEV",
  authorUrl: "https://new-profotilo-flame.vercel.app/",
} as const;

export const DEFAULT_SETTINGS: Settings = {
  upiId: "pmharsh@fam",
  upiName: "TIMEPASS PREMIUM",
  razorpayLink: "https://razorpay.me/@pmharsh",
  telegramChannel: "https://t.me/TIMEPASS_BACKUP_1",
  telegramSupport: "https://t.me/pmharsh",
  supportEmail: "pmharshu2035@gmail.com",
  maintenance: false,
  announcement: "",
};

export const ADMIN_COOKIE = "tp_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
