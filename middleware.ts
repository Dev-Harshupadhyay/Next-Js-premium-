import { NextResponse, type NextRequest } from "next/server";
// Subpath import: full `jose` barrel pulls in JWE decrypt → DecompressionStream,
// jo Edge Runtime me supported nahi hai. Sirf JWT verify chahiye.
import { jwtVerify } from "jose/jwt/verify";
import { ADMIN_COOKIE } from "@/lib/config";

const encoder = new TextEncoder();

function secretKey(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "tp-dev-secret-change-me-in-production-please";
  return encoder.encode(secret.padEnd(32, "#"));
}

/**
 * Edge middleware — /admin/* pe page render hone se PEHLE hi gate.
 * Purane version me admin panel ka HTML har visitor ke browser me
 * ship ho jata tha; ab unauthenticated user ko markup milta hi nahi.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, secretKey(), {
        issuer: "timepass-premium",
        audience: "admin",
      });
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (pathname === "/admin/login") {
    if (valid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!valid) {
    const url = new URL("/admin/login", request.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
