import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";
import { settingsSchema } from "@/lib/validation";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ settings: await getSettings() });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: first
          ? `${first.path.join(".")}: ${first.message}`
          : "Invalid settings",
      },
      { status: 400 },
    );
  }

  const settings = await saveSettings(parsed.data);
  return NextResponse.json({ settings });
}
