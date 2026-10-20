import { NextResponse } from "next/server";

import { resolveAvatarMap } from "@/lib/roblox/avatars";

export async function POST(request: Request) {
  let body: { usernames?: unknown; userIds?: unknown };
  try {
    body = (await request.json()) as { usernames?: unknown; userIds?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const usernames = Array.isArray(body.usernames)
    ? body.usernames.filter((value): value is string => typeof value === "string").slice(0, 100)
    : [];
  const userIds = Array.isArray(body.userIds)
    ? body.userIds
        .map((value) => (typeof value === "number" ? value : Number(value)))
        .filter((value) => Number.isFinite(value) && value > 0)
        .slice(0, 100)
    : [];

  if (usernames.length === 0 && userIds.length === 0) {
    return NextResponse.json({ ok: true, byUsername: {}, byUserId: {} });
  }

  const result = await resolveAvatarMap({ usernames, userIds });
  return NextResponse.json({ ok: true, ...result });
}
