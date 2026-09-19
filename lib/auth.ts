import "server-only";
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, SESSION_TTL_SECONDS } from "./config";

const encoder = new TextEncoder();

function secretKey(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "tp-dev-secret-change-me-in-production-please";
  // jose needs >= 32 bytes for HS256
  return encoder.encode(secret.padEnd(32, "#"));
}

export interface SessionPayload {
  sub: "admin";
  iat: number;
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("timepass-premium")
    .setAudience("admin")
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secretKey(), {
      issuer: "timepass-premium",
      audience: "admin",
    });
    return true;
  } catch {
    return false;
  }
}

/** Server Components / Route Handlers me use karo. */
export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/**
 * Timing-safe string compare — brute force timing attacks se bachata hai.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still burn comparable time.
    let sink = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
      sink |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return false && sink === 0;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
