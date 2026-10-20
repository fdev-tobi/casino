import { NextResponse } from "next/server";

import { createChallenge, lookupRobloxUser } from "@/lib/auth/roblox-verify";

export async function POST(request: Request) {
  let body: { username?: string };
  try {
    body = (await request.json()) as { username?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  if (username.length < 3 || username.length > 20) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid Roblox username (3–20 characters)." },
      { status: 400 },
    );
  }

  const lookup = await lookupRobloxUser(username);
  if (!lookup.ok) {
    return NextResponse.json(
      { ok: false, error: lookup.message },
      { status: lookup.code === "not_found" ? 404 : 503 },
    );
  }

  const challenge = createChallenge(lookup.name);

  return NextResponse.json({
    ok: true,
    challengeId: challenge.challengeId,
    phrase: challenge.phrase,
    username: lookup.name,
    displayName: lookup.displayName,
  });
}
