import { NextResponse } from "next/server";

import {
  cancelDepositSession,
  getDepositSession,
  refreshDepositSession,
  toPublicSession,
} from "@/lib/deposit/sessions";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await refreshDepositSession(id);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Deposit session not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, session: toPublicSession(session) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!getDepositSession(id)) {
    return NextResponse.json({ ok: false, error: "Deposit session not found." }, { status: 404 });
  }
  const session = cancelDepositSession(id);
  return NextResponse.json({ ok: true, session: session ? toPublicSession(session) : null });
}
