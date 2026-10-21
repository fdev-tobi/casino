import "server-only";

import { catalogItems } from "@/lib/mock-data";
import type { DemoItem } from "@/types/lobby";

export type DepositStatus =
  | "waiting_join"
  | "in_game"
  | "awaiting_trade"
  | "completed"
  | "expired"
  | "cancelled";

export type DepositSession = {
  id: string;
  userId: number;
  username: string;
  status: DepositStatus;
  botUsername: string;
  joinUrl: string;
  placeId: number;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  inGameSince: number | null;
  items: DemoItem[];
  message: string;
};

const SESSION_TTL_MS = 15 * 60 * 1000;
const AUTO_CREDIT_AFTER_IN_GAME_MS = Number(
  process.env.DEPOSIT_AUTO_CREDIT_MS ?? 12_000,
);

const sessions = new Map<string, DepositSession>();

function prune() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now && session.status !== "completed") {
      session.status = "expired";
      session.message = "Deposit session expired. Start again.";
      session.updatedAt = now;
      sessions.delete(id);
    }
  }
}

export function getDepositConfig() {
  const placeId = Number(process.env.DEPOSIT_PLACE_ID ?? 920587237);
  const joinUrl =
    process.env.DEPOSIT_JOIN_URL?.trim() ||
    `https://www.roblox.com/games/${placeId}/Adopt-Me`;
  const botUsername = process.env.DEPOSIT_BOT_USERNAME?.trim() || "AdoptLuckBot";
  return { placeId, joinUrl, botUsername };
}

export function createDepositSession(input: {
  userId: number;
  username: string;
}): DepositSession {
  prune();
  const cfg = getDepositConfig();
  const now = Date.now();
  const session: DepositSession = {
    id: crypto.randomUUID(),
    userId: input.userId,
    username: input.username.trim(),
    status: "waiting_join",
    botUsername: cfg.botUsername,
    joinUrl: cfg.joinUrl,
    placeId: cfg.placeId,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + SESSION_TTL_MS,
    inGameSince: null,
    items: [],
    message: "Join the Adopt Me server. We’ll detect you automatically.",
  };
  sessions.set(session.id, session);
  return session;
}

export function getDepositSession(id: string): DepositSession | null {
  prune();
  return sessions.get(id) ?? null;
}

export function cancelDepositSession(id: string): DepositSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  if (session.status === "completed") return session;
  session.status = "cancelled";
  session.message = "Deposit cancelled.";
  session.updatedAt = Date.now();
  return session;
}

function pickAutoCreditItems(): DemoItem[] {
  const pool = [
    catalogItems[10],
    catalogItems[11],
    catalogItems[8],
    catalogItems[9],
    catalogItems[6],
    catalogItems[5],
    catalogItems[7],
    catalogItems[4],
  ];
  const count = 2 + Math.floor(Math.random() * 3);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count).map((item) => ({ ...item }));
}

export function matchCatalogItem(name: string): DemoItem | null {
  const key = name.trim().toLowerCase();
  const hit = catalogItems.find((item) => item.name.toLowerCase() === key);
  return hit ? { ...hit } : null;
}

export function completeDepositSession(
  id: string,
  items: DemoItem[],
  message = "Trade complete. Pets credited to your inventory.",
): DepositSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  if (session.status === "completed") return session;
  session.status = "completed";
  session.items = items;
  session.message = message;
  session.updatedAt = Date.now();
  return session;
}

export async function refreshDepositSession(id: string): Promise<DepositSession | null> {
  const session = sessions.get(id);
  if (!session) return null;
  if (
    session.status === "completed" ||
    session.status === "expired" ||
    session.status === "cancelled"
  ) {
    return session;
  }

  const presence = await fetchUserPresence(session.userId);
  const now = Date.now();
  const inTargetPlace =
    presence?.userPresenceType === 2 &&
    (presence.rootPlaceId === session.placeId || presence.placeId === session.placeId);

  if (inTargetPlace) {
    if (!session.inGameSince) {
      session.inGameSince = now;
      session.status = "in_game";
      session.message = `Found you in Adopt Me. Trade ${session.botUsername} — pets credit automatically.`;
      session.updatedAt = now;
    } else if (session.status === "in_game") {
      session.status = "awaiting_trade";
      session.message = `Waiting for your trade with ${session.botUsername}…`;
      session.updatedAt = now;
    }

    const autoCredit = process.env.DEPOSIT_AUTO_CREDIT !== "0";
    const waited = now - (session.inGameSince ?? now);
    if (autoCredit && waited >= AUTO_CREDIT_AFTER_IN_GAME_MS) {
      return completeDepositSession(
        id,
        pickAutoCreditItems(),
        "Trade received. Pets credited to your inventory.",
      );
    }
  } else if (session.status === "waiting_join") {
    session.message = "Join the Adopt Me server. We’ll detect you automatically.";
    session.updatedAt = now;
  } else if (session.status === "in_game" || session.status === "awaiting_trade") {
    // Left the place — keep waiting for rejoin within the session TTL.
    session.status = "waiting_join";
    session.inGameSince = null;
    session.message = "We lost you in-game. Join the server again.";
    session.updatedAt = now;
  }

  return session;
}

type PresenceRow = {
  userPresenceType: number;
  placeId: number | null;
  rootPlaceId: number | null;
  userId: number;
};

async function fetchUserPresence(userId: number): Promise<PresenceRow | null> {
  try {
    const response = await fetch("https://presence.roblox.com/v1/presence/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ userIds: [userId] }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { userPresences?: PresenceRow[] };
    return json.userPresences?.[0] ?? null;
  } catch {
    return null;
  }
}

export function toPublicSession(session: DepositSession) {
  return {
    id: session.id,
    status: session.status,
    botUsername: session.botUsername,
    joinUrl: session.joinUrl,
    placeId: session.placeId,
    message: session.message,
    items: session.items,
    expiresAt: session.expiresAt,
    updatedAt: session.updatedAt,
  };
}
