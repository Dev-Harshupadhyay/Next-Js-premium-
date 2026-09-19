import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const globalBuckets = globalThis as unknown as {
  __tpBuckets?: Map<string, Bucket>;
};

function buckets(): Map<string, Bucket> {
  globalBuckets.__tpBuckets ??= new Map();
  return globalBuckets.__tpBuckets;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number;
}

/**
 * Simple fixed-window limiter. Serverless pe per-instance hai —
 * casual abuse rokne ke liye kaafi, distributed guarantee ke liye
 * Upstash Ratelimit pe switch karo.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const map = buckets();
  const bucket = map.get(key);

  if (!bucket || bucket.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

export function clientKey(headers: Headers, scope: string): string {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown";
  return `${scope}:${ip}`;
}
