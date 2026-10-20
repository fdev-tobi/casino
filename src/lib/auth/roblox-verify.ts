import "server-only";

const PHRASE_WORDS = [
  "AIR",
  "ADMINISTRATION",
  "EVENING",
  "BOX",
  "THAT",
  "PREMIUM",
  "RIVER",
  "SILVER",
  "ORBIT",
  "LANTERN",
  "CIRCUIT",
  "HAVEN",
  "MIRROR",
  "SIGNAL",
  "QUARTZ",
  "EMBER",
] as const;

type Challenge = {
  username: string;
  phrase: string;
  expiresAt: number;
};

const challenges = new Map<string, Challenge>();
const CHALLENGE_TTL_MS = 15 * 60 * 1000;

function pruneExpired() {
  const now = Date.now();
  for (const [id, challenge] of challenges) {
    if (challenge.expiresAt <= now) {
      challenges.delete(id);
    }
  }
}

export function buildPhrase(): string {
  const picks: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    picks.push(PHRASE_WORDS[Math.floor(Math.random() * PHRASE_WORDS.length)]);
  }
  return picks.join(" ");
}

export function createChallenge(username: string): { challengeId: string; phrase: string } {
  pruneExpired();
  const normalized = username.trim();
  const challengeId = crypto.randomUUID();
  const phrase = buildPhrase();
  challenges.set(challengeId, {
    username: normalized,
    phrase,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  });
  return { challengeId, phrase };
}

export function getChallenge(challengeId: string): Challenge | null {
  pruneExpired();
  const challenge = challenges.get(challengeId);
  if (!challenge) return null;
  if (challenge.expiresAt <= Date.now()) {
    challenges.delete(challengeId);
    return null;
  }
  return challenge;
}

export function consumeChallenge(challengeId: string): void {
  challenges.delete(challengeId);
}

export type RobloxLookupResult =
  | { ok: true; userId: number; name: string; displayName: string; description: string }
  | { ok: false; code: "not_found" | "upstream_error"; message: string };

export async function lookupRobloxUser(username: string): Promise<RobloxLookupResult> {
  try {
    const resolveResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        usernames: [username.trim()],
        excludeBannedUsers: true,
      }),
      cache: "no-store",
    });

    if (!resolveResponse.ok) {
      return {
        ok: false,
        code: "upstream_error",
        message: "Could not reach Roblox to look up that username.",
      };
    }

    const resolveJson = (await resolveResponse.json()) as {
      data?: Array<{ id: number; name: string; displayName: string }>;
    };
    const match = resolveJson.data?.[0];
    if (!match) {
      return {
        ok: false,
        code: "not_found",
        message: "No Roblox account was found for that username.",
      };
    }

    const profileResponse = await fetch(`https://users.roblox.com/v1/users/${match.id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!profileResponse.ok) {
      return {
        ok: false,
        code: "upstream_error",
        message: "Could not load that Roblox profile.",
      };
    }

    const profile = (await profileResponse.json()) as {
      id: number;
      name: string;
      displayName: string;
      description?: string | null;
    };

    return {
      ok: true,
      userId: profile.id,
      name: profile.name,
      displayName: profile.displayName,
      description: profile.description ?? "",
    };
  } catch {
    return {
      ok: false,
      code: "upstream_error",
      message: "Roblox verification is temporarily unavailable.",
    };
  }
}

export function profileContainsPhrase(description: string, phrase: string): boolean {
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim().toUpperCase();
  return normalize(description).includes(normalize(phrase));
}
