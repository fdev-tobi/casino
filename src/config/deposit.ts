/** Defaults for Adopt Me deposit. Override with env in production. */
export const depositConfig = {
  gameName: "Adopt Me",
  placeId: Number(process.env.NEXT_PUBLIC_DEPOSIT_PLACE_ID ?? 920587237),
  joinUrl:
    process.env.NEXT_PUBLIC_DEPOSIT_JOIN_URL?.trim() ||
    "https://www.roblox.com/games/920587237/Adopt-Me",
  botUsername: process.env.NEXT_PUBLIC_DEPOSIT_BOT_USERNAME?.trim() || "AdoptLuckBot",
} as const;
