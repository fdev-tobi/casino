import "server-only";

const HEADSHOT_SIZE = "150x150" as const;

export async function resolveRobloxUserIds(
  usernames: string[],
): Promise<Map<string, number>> {
  const unique = [...new Set(usernames.map((name) => name.trim()).filter(Boolean))];
  const byUsername = new Map<string, number>();
  if (unique.length === 0) return byUsername;

  try {
    const response = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        usernames: unique,
        excludeBannedUsers: true,
      }),
      cache: "no-store",
    });
    if (!response.ok) return byUsername;

    const json = (await response.json()) as {
      data?: Array<{ id: number; name: string; requestedUsername?: string }>;
    };

    for (const entry of json.data ?? []) {
      const key = (entry.requestedUsername || entry.name).toLowerCase();
      byUsername.set(key, entry.id);
      byUsername.set(entry.name.toLowerCase(), entry.id);
    }
  } catch {
    // ignore upstream failures — callers fall back to initials
  }

  return byUsername;
}

export async function fetchRobloxHeadshots(
  userIds: number[],
): Promise<Map<number, string>> {
  const unique = [...new Set(userIds.filter((id) => Number.isFinite(id) && id > 0))];
  const byId = new Map<number, string>();
  if (unique.length === 0) return byId;

  // Roblox thumbnail endpoint accepts up to 100 ids per request.
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    try {
      const url = new URL("https://thumbnails.roblox.com/v1/users/avatar-headshot");
      url.searchParams.set("userIds", batch.join(","));
      url.searchParams.set("size", HEADSHOT_SIZE);
      url.searchParams.set("format", "Png");
      url.searchParams.set("isCircular", "false");

      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) continue;

      const json = (await response.json()) as {
        data?: Array<{ targetId: number; state: string; imageUrl?: string }>;
      };

      for (const entry of json.data ?? []) {
        if (entry.state === "Completed" && entry.imageUrl) {
          byId.set(entry.targetId, entry.imageUrl);
        }
      }
    } catch {
      // continue other batches
    }
  }

  return byId;
}

export async function resolveAvatarMap(input: {
  usernames?: string[];
  userIds?: number[];
}): Promise<{
  byUsername: Record<string, string>;
  byUserId: Record<string, string>;
}> {
  const usernameList = input.usernames ?? [];
  const idList = [...(input.userIds ?? [])];

  const usernameToId = await resolveRobloxUserIds(usernameList);
  for (const id of usernameToId.values()) {
    idList.push(id);
  }

  const headshots = await fetchRobloxHeadshots(idList);
  const byUsername: Record<string, string> = {};
  const byUserId: Record<string, string> = {};

  for (const [id, url] of headshots) {
    byUserId[String(id)] = url;
  }

  for (const [username, id] of usernameToId) {
    const url = headshots.get(id);
    if (url) {
      byUsername[username] = url;
    }
  }

  return { byUsername, byUserId };
}
