import "server-only";

export interface RequestInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  referer: string;
  userAgent: string;
}

/**
 * Geo/device info request headers se — adblock isko block nahi kar sakta,
 * aur koi 3rd party IP API call nahi jaati.
 * Vercel automatically x-vercel-ip-* headers add karta hai.
 */
export function readRequestInfo(headers: Headers): RequestInfo {
  const ua = headers.get("user-agent") ?? "";
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown";

  return {
    ip,
    country: decodeHeader(headers.get("x-vercel-ip-country")),
    region: decodeHeader(headers.get("x-vercel-ip-country-region")),
    city: decodeHeader(headers.get("x-vercel-ip-city")),
    device: detectDevice(ua),
    browser: detectBrowser(ua),
    os: detectOS(ua),
    referer: headers.get("referer") ?? "direct",
    userAgent: ua.slice(0, 300),
  };
}

function decodeHeader(value: string | null): string {
  if (!value) return "?";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function detectDevice(ua: string): string {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "📱 Tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "📱 Mobile";
  if (!ua) return "🤖 Unknown";
  return "💻 Desktop";
}

export function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua)) return "Safari";
  return "Unknown";
}

export function detectOS(ua: string): string {
  if (/Windows NT 10/i.test(ua)) return "Windows 10/11";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Android/i.test(ua)) {
    const match = /Android (\d+)/i.exec(ua);
    return match ? `Android ${match[1]}` : "Android";
  }
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}
