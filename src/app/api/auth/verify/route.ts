import { NextResponse } from "next/server";

import {
  consumeChallenge,
  getChallenge,
  lookupRobloxUser,
  profileContainsPhrase,
} from "@/lib/auth/roblox-verify";

export async function POST(request: Request) {
  let body: { challengeId?: string };
  try {
    body = (await request.json()) as { challengeId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const challengeId = body.challengeId?.trim() ?? "";
  if (!challengeId) {
    return NextResponse.json({ ok: false, error: "Missing verification challenge." }, { status: 400 });
  }

  const challenge = getChallenge(challengeId);
  if (!challenge) {
    return NextResponse.json(
      {
        ok: false,
        code: "expired",
        error: "Your verification code expired. Request a new code and try again.",
      },
      { status: 410 },
    );
  }

  const lookup = await lookupRobloxUser(challenge.username);
  if (!lookup.ok) {
    return NextResponse.json(
      { ok: false, code: lookup.code, error: lookup.message },
      { status: lookup.code === "not_found" ? 404 : 503 },
    );
  }

  if (!profileContainsPhrase(lookup.description, challenge.phrase)) {
    return NextResponse.json(
      {
        ok: false,
        code: "missing_phrase",
        error:
          "We could not find your verification code in your Roblox profile About section. Paste the code into your bio, save, then try again.",
      },
      { status: 403 },
    );
  }

  consumeChallenge(challengeId);

  return NextResponse.json({
    ok: true,
    username: lookup.name,
    displayName: lookup.displayName,
    userId: lookup.userId,
  });
}
