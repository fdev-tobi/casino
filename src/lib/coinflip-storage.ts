import { coinFlipGames } from "@/lib/mock-data";
import type { CoinFlipGame } from "@/types/lobby";

export const COINFLIP_GAMES_STORAGE_KEY = "adoptluck-coinflip-games-v1";
const CREDITED_KEY = "adoptluck-coinflip-credited-v1";

function normalizeGame(game: CoinFlipGame): CoinFlipGame {
  return {
    ...game,
    joinerItems: game.joinerItems ?? [],
    flipStartedAt: game.flipStartedAt ?? null,
    winnerSide: game.winnerSide ?? null,
  };
}

export function loadCoinFlipGames(): CoinFlipGame[] {
  const seed = coinFlipGames.map((game) => normalizeGame({ ...game }));
  if (typeof window === "undefined") return seed;

  try {
    const raw = window.localStorage.getItem(COINFLIP_GAMES_STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as CoinFlipGame[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seed;
    return parsed.map((game) => normalizeGame(game));
  } catch {
    return seed;
  }
}

export function saveCoinFlipGames(games: readonly CoinFlipGame[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COINFLIP_GAMES_STORAGE_KEY, JSON.stringify(games));
  } catch {
    // ignore quota / private mode
  }
}

export function loadCreditedFlipIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(CREDITED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function saveCreditedFlipIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CREDITED_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}
