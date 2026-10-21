import { NextResponse } from "next/server";

import {
  completeDepositSession,
  getDepositSession,
  matchCatalogItem,
  toPublicSession,
} from "@/lib/deposit/sessions";
import type { DemoItem } from "@/types/lobby";

/**
 * Called by a live deposit bot after it accepts an in-game trade.
 * Header: Authorization: Bearer $DEPOSIT_BOT_SECRET
 */
export async function POST(request: Request) {
  const secret = process.env.DEPOSIT_BOT_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Bot webhook is not configured (DEPOSIT_BOT_SECRET)." },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: { sessionId?: string; items?: Array<{ name: string; value?: number }> };
  try {
    body = (await request.json()) as {
      sessionId?: string;
      items?: Array<{ name: string; value?: number }>;
    };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim() ?? "";
  if (!sessionId || !getDepositSession(sessionId)) {
    return NextResponse.json({ ok: false, error: "Unknown deposit session." }, { status: 404 });
  }

  const items: DemoItem[] = [];
  for (const entry of body.items ?? []) {
    const matched = matchCatalogItem(entry.name);
    if (matched) {
      items.push(matched);
    }
  }

  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No recognized Adopt Me pets in the trade payload." },
      { status: 400 },
    );
  }

  const session = completeDepositSession(sessionId, items);
  return NextResponse.json({ ok: true, session: session ? toPublicSession(session) : null });
}
