import type { Settings } from "./types";

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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://verceel-timepass.vercel.app",
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
