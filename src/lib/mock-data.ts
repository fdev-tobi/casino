import type {
  ChatMessage,
  CoinFlipGame,
  DemoItem,
  DemoPlayer,
  HistoryEntry,
  JackpotRound,
  LeaderboardRow,
  LiveWin,
  RaceBoard,
  UpgraderItem,
} from "@/types/lobby";

const players: readonly DemoPlayer[] = [
  { id: "p1", name: "NovaSeat", initials: "NS", color: "#5468f1" },
  { id: "p2", name: "TideMark", initials: "TM", color: "#3dd6c6" },
  { id: "p3", name: "AshRail", initials: "AR", color: "#f0a35e" },
  { id: "p4", name: "QuietAnte", initials: "QA", color: "#c084fc" },
  { id: "p5", name: "CircuitLynx", initials: "CL", color: "#34d399" },
  { id: "p6", name: "HarborWick", initials: "HW", color: "#fb7185" },
  { id: "p7", name: "MarbleFan", initials: "MF", color: "#60a5fa" },
  { id: "p8", name: "SecondLight", initials: "SL", color: "#a78bfa" },
];

const IMG = "https://data.amverse.co/images/pets";

function item(
  id: string,
  name: string,
  value: number,
  tone: DemoItem["tone"],
  imageFile: string,
): DemoItem {
  return {
    id,
    name,
    value,
    tone,
    imageUrl: `${IMG}/${encodeURIComponent(imageFile)}`,
  };
}

/** Demo inventory ids match `display-values.snapshot.json` (AMVerse ×2). */
export const catalogItems: readonly DemoItem[] = [
  item("pet-bat-dragon", "Bat Dragon", 2030, "amber", "Bat Dragon.png"),
  item("pet-shadow-dragon", "Shadow Dragon", 1690, "amber", "Shadow Dragon.png"),
  item("pet-giraffe", "Giraffe", 948, "lime", "Giraffe.png"),
  item("pet-frost-dragon", "Frost Dragon", 654, "cyan", "Frost Dragon.png"),
  item("pet-owl", "Owl", 493, "violet", "Owl.png"),
  item("pet-parrot", "Parrot", 395, "rose", "Parrot.png"),
  item("pet-crow", "Crow", 356, "slate", "Crow.png"),
  item("pet-evil-unicorn", "Evil Unicorn", 232, "violet", "Evil Unicorn.png"),
  item("pet-dalmatian", "Dalmatian", 129, "rose", "Dalmatian.png"),
  item("pet-arctic-reindeer", "Arctic Reindeer", 107, "cyan", "Arctic Reindeer.png"),
  item("pet-turtle", "Turtle", 50, "lime", "Turtle.png"),
  item("pet-kangaroo", "Kangaroo", 37.5, "slate", "Kangaroo.png"),
  item("pet-shadow-dragon-neon", "Neon Shadow Dragon", 4041, "amber", "Shadow Dragon.png"),
  item("pet-frost-dragon-neon", "Neon Frost Dragon", 1260, "cyan", "Frost Dragon.png"),
  item("pet-bat-dragon-mega", "Mega Bat Dragon", 14921, "amber", "Bat Dragon.png"),
];

function rangeAround(value: number): { min: number; max: number } {
  const spread = Math.max(1, Math.round(value * 0.05));
  return { min: value - spread, max: value + spread };
}

function gameValue(items: readonly DemoItem[]): number {
  return items.reduce((sum, entry) => sum + entry.value, 0);
}

export const lobbyStats = {
  totalItems: catalogItems.length * 5 + 4,
  totalValue: Math.round(catalogItems.reduce((sum, entry) => sum + entry.value, 0) * 1.15),
  activeGames: 10,
} as const;

export const coinFlipGames: readonly CoinFlipGame[] = [
  {
    id: "cf-01",
    hash: "a7c91e2b0f4d88e1c3b9a012ff65d441",
    catalog: "adoptme",
    status: "open",
    host: players[0],
    joiner: null,
    hostSide: "heads",
    items: [catalogItems[1]],
    value: catalogItems[1].value,
    ...(() => {
      const r = rangeAround(catalogItems[1].value);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T10:01:00.000Z",
  },
  {
    id: "cf-02",
    hash: "b2d40aa19c77ef0012a88bcd9911ee20",
    catalog: "adoptme",
    status: "open",
    host: players[1],
    joiner: null,
    hostSide: "heads",
    items: [catalogItems[2]],
    value: catalogItems[2].value,
    ...(() => {
      const r = rangeAround(catalogItems[2].value);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T10:02:00.000Z",
  },
  {
    id: "cf-03",
    hash: "c9910022ab33cd44ee55ff6677889900",
    catalog: "adoptme",
    status: "open",
    host: players[2],
    joiner: null,
    hostSide: "heads",
    items: [catalogItems[9], catalogItems[10]],
    value: gameValue([catalogItems[9], catalogItems[10]]),
    ...(() => {
      const v = gameValue([catalogItems[9], catalogItems[10]]);
      const r = rangeAround(v);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T10:03:00.000Z",
  },
  {
    id: "cf-04",
    hash: "f7390a0bfff025a1beadd328d5b67d1c",
    catalog: "adoptme",
    status: "full",
    host: players[6],
    joiner: players[3],
    hostSide: "heads",
    items: [catalogItems[0]],
    value: catalogItems[0].value,
    ...(() => {
      const r = rangeAround(catalogItems[0].value);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T09:55:00.000Z",
  },
  {
    id: "cf-05",
    hash: "d1e2f3a4b5c697887766554433221100",
    catalog: "adoptme",
    status: "open",
    host: players[4],
    joiner: null,
    hostSide: "heads",
    items: [catalogItems[4]],
    value: catalogItems[4].value,
    ...(() => {
      const r = rangeAround(catalogItems[4].value);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T10:04:00.000Z",
  },
  {
    id: "cf-06",
    hash: "11223344556677889900aabbccddeeff",
    catalog: "adoptme",
    status: "open",
    host: players[5],
    joiner: null,
    hostSide: "heads",
    items: [catalogItems[7]],
    value: catalogItems[7].value,
    ...(() => {
      const r = rangeAround(catalogItems[7].value);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T10:05:00.000Z",
  },
  {
    id: "cf-07",
    hash: "99887766554433221100ffeeddccbbaa",
    catalog: "adoptme",
    status: "open",
    host: players[7],
    joiner: null,
    hostSide: "heads",
    items: [catalogItems[8]],
    value: catalogItems[8].value,
    ...(() => {
      const r = rangeAround(catalogItems[8].value);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T10:06:00.000Z",
  },
  {
    id: "cf-08",
    hash: "0f1e2d3c4b5a69788796a5b4c3d2e1f0",
    catalog: "adoptme",
    status: "open",
    host: players[0],
    joiner: null,
    hostSide: "heads",
    items: [catalogItems[11]],
    value: catalogItems[11].value,
    ...(() => {
      const r = rangeAround(catalogItems[11].value);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T10:07:00.000Z",
  },
  {
    id: "cf-09",
    hash: "abcdef0123456789fedcba9876543210",
    catalog: "adoptme",
    status: "open",
    host: players[1],
    joiner: null,
    hostSide: "heads",
    items: [catalogItems[6]],
    value: catalogItems[6].value,
    ...(() => {
      const r = rangeAround(catalogItems[6].value);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T10:08:00.000Z",
  },
  {
    id: "cf-10",
    hash: "55aa66bb77cc88dd99ee00ff11223344",
    catalog: "adoptme",
    status: "ended",
    host: players[2],
    joiner: players[4],
    hostSide: "heads",
    items: [catalogItems[12], catalogItems[5]],
    value: gameValue([catalogItems[12], catalogItems[5]]),
    ...(() => {
      const v = gameValue([catalogItems[12], catalogItems[5]]);
      const r = rangeAround(v);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T09:40:00.000Z",
  },
];

const jackpotEntries = [
  {
    id: "jp-1",
    player: players[0],
    items: [catalogItems[1]],
    value: catalogItems[1].value,
  },
  {
    id: "jp-2",
    player: players[5],
    items: [catalogItems[3]],
    value: catalogItems[3].value,
  },
  {
    id: "jp-3",
    player: players[3],
    items: [catalogItems[4]],
    value: catalogItems[4].value,
  },
  {
    id: "jp-4",
    player: players[7],
    items: [catalogItems[7]],
    value: catalogItems[7].value,
  },
] as const;

const jackpotPot = jackpotEntries.reduce((sum, entry) => sum + entry.value, 0);

export const jackpotRound: JackpotRound = {
  catalog: "adoptme",
  pot: jackpotPot,
  secondsLeft: 87,
  duration: 120,
  entries: jackpotEntries.map((entry) => ({
    ...entry,
    chance: (entry.value / jackpotPot) * 100,
  })),
};

export const upgraderItems: readonly UpgraderItem[] = [
  { ...catalogItems[14] },
  item("pet-shadow-dragon-mega", "Mega Shadow Dragon", 10640, "amber", "Shadow Dragon.png"),
  item("pet-giraffe-mega", "Mega Giraffe", 9248, "lime", "Giraffe.png"),
  { ...catalogItems[12] },
  { ...catalogItems[0] },
  { ...catalogItems[1] },
  { ...catalogItems[13] },
  { ...catalogItems[2] },
  { ...catalogItems[3] },
  { ...catalogItems[4] },
  { ...catalogItems[5] },
  { ...catalogItems[6] },
];

export const liveWins: readonly LiveWin[] = [
  { id: "lw1", player: "NovaSeat", from: 50, gain: 57, to: 107, multiplier: 2.14, fromTone: "lime", toTone: "cyan" },
  { id: "lw2", player: "TideMark", from: 232, gain: 124, to: 356, multiplier: 1.53, fromTone: "violet", toTone: "slate" },
  { id: "lw3", player: "AshRail", from: 1690, gain: 340, to: 2030, multiplier: 1.2, fromTone: "amber", toTone: "amber" },
  { id: "lw4", player: "QuietAnte", from: 37.5, gain: 12.5, to: 50, multiplier: 1.33, fromTone: "slate", toTone: "lime" },
  { id: "lw5", player: "CircuitLynx", from: 395, gain: 98, to: 493, multiplier: 1.25, fromTone: "rose", toTone: "violet" },
  { id: "lw6", player: "HarborWick", from: 654, gain: 294, to: 948, multiplier: 1.45, fromTone: "cyan", toTone: "lime" },
];

export const raceBoard: RaceBoard = {
  prizePool: 40450,
  endsInSeconds: 62 * 3600 + 14 * 60 + 33,
  standings: [
    { rank: 1, player: players[1], wagered: 2522160, prize: 14500 },
    { rank: 2, player: players[0], wagered: 2456184, prize: 8650 },
    { rank: 3, player: players[6], wagered: 1917090, prize: 4400 },
    { rank: 4, player: players[4], wagered: 1682233, prize: 3500 },
    { rank: 5, player: players[2], wagered: 1672884, prize: 2350 },
    { rank: 6, player: players[7], wagered: 1161989, prize: 2350 },
    { rank: 7, player: players[3], wagered: 1142267, prize: 2350 },
    { rank: 8, player: players[5], wagered: 1097835, prize: 2350 },
  ],
};

export const leaderboard: readonly LeaderboardRow[] = [
  { rank: 1, player: players[1], wins: 184, profit: 128400 },
  { rank: 2, player: players[0], wins: 161, profit: 102250 },
  { rank: 3, player: players[4], wins: 142, profit: 88600 },
  { rank: 4, player: players[6], wins: 128, profit: 74120 },
  { rank: 5, player: players[2], wins: 110, profit: 60340 },
  { rank: 6, player: players[7], wins: 98, profit: 51200 },
  { rank: 7, player: players[3], wins: 86, profit: 43880 },
  { rank: 8, player: players[5], wins: 74, profit: 36110 },
];

export const chatMessages: readonly ChatMessage[] = [
  { id: "c1", user: "NovaSeat", text: "Lobby looks clean today.", at: "12:01" },
  { id: "c2", user: "TideMark", text: "Anyone joining high rollers?", at: "12:02" },
  { id: "c3", user: "AshRail", text: "Checking the upgrader list.", at: "12:03" },
  { id: "c4", user: "CircuitLynx", text: "Race is heating up.", at: "12:04" },
  { id: "c5", user: "HarborWick", text: "Good luck everyone.", at: "12:05" },
];

export const historyEntries: readonly HistoryEntry[] = [
  {
    id: "h1",
    mode: "coinflip",
    summary: "Viewed Shadow Dragon match",
    value: 1690,
    at: "11:40",
    outcome: "viewed",
  },
  {
    id: "h2",
    mode: "jackpot",
    summary: "Joined demo pot",
    value: 654,
    at: "11:22",
    outcome: "lost",
  },
  {
    id: "h3",
    mode: "upgrader",
    summary: "Previewed Mega Bat Dragon upgrade",
    value: 14921,
    at: "10:58",
    outcome: "viewed",
  },
  {
    id: "h4",
    mode: "race",
    summary: "Opened race standings",
    value: 40450,
    at: "10:11",
    outcome: "viewed",
  },
];

/** Default pet used when creating a local demo wager. */
export const defaultWagerItem: DemoItem = catalogItems[10];

/** Starter pets treated as already deposited for the logged-in demo inventory. */
export const initialDepositedInventory: readonly DemoItem[] = [
  catalogItems[10],
  catalogItems[11],
  catalogItems[8],
  catalogItems[9],
  catalogItems[4],
  catalogItems[5],
  catalogItems[6],
  catalogItems[3],
];

export function getCoinFlipById(id: string): CoinFlipGame | undefined {
  return coinFlipGames.find((game) => game.id === id);
}
