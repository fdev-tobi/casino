import { NextResponse } from "next/server";

import { lookupRobloxUser } from "@/lib/auth/roblox-verify";
import { createDepositSession, toPublicSession } from "@/lib/deposit/sessions";

export async function POST(request: Request) {
  let body: { userId?: number; username?: string };
  try {
    body = (await request.json()) as { userId?: number; username?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  let userId = Number(body.userId);
  const username = body.username?.trim() ?? "";
  if (username.length < 3) {
    return NextResponse.json(
      { ok: false, error: "Login with Roblox is required to deposit." },
      { status: 401 },
    );
  }

  if (!Number.isFinite(userId) || userId <= 0) {
    const lookup = await lookupRobloxUser(username);
    if (!lookup.ok) {
      return NextResponse.json({ ok: false, error: lookup.message }, { status: 404 });
    }
    userId = lookup.userId;
  }

  const session = createDepositSession({ userId, username });
  return NextResponse.json({ ok: true, session: toPublicSession(session), userId });
}
