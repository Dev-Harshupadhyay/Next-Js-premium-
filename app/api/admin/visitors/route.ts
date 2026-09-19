import { NextResponse } from "next/server";
import { clearVisitors, listVisitors } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const visitors = await listVisitors();
  return NextResponse.json({ visitors });
}

export async function DELETE() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await clearVisitors();
  return NextResponse.json({ ok: true });
}
