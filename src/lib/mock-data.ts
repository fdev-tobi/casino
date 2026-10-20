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

function item(id: string, name: string, value: number, tone: DemoItem["tone"]): DemoItem {
  return { id, name, value, tone };
}

const catalogItems: readonly DemoItem[] = [
  item("i1", "Harvester", 250, "lime"),
  item("i2", "Ember Scythe", 900, "amber"),
  item("i3", "Night Circuit Blade", 350, "violet"),
  item("i4", "Harbor Chips", 98, "cyan"),
  item("i5", "Quiet Mantle", 160, "slate"),
  item("i6", "Vale Compass", 540, "cyan"),
  item("i7", "Ash Key", 27, "slate"),
  item("i8", "Tide Seal", 23, "cyan"),
  item("i9", "Amber Quill", 16, "amber"),
  item("i10", "Long Room Pennant", 13, "rose"),
  item("i11", "Circuit Ledger", 12, "violet"),
  item("i12", "Pool Notes", 6, "cyan"),
  item("i13", "Second-Seat Ring", 3, "rose"),
  item("i14", "Ember Bow", 1800, "amber"),
  item("i15", "Northglass Lantern", 240, "cyan"),
];

function rangeAround(value: number): { min: number; max: number } {
  const spread = Math.max(1, Math.round(value * 0.05));
  return { min: value - spread, max: value + spread };
}

export const lobbyStats = {
  totalItems: catalogItems.length * 5 + 4,
  totalValue: 29620,
  activeGames: 10,
} as const;

export const coinFlipGames: readonly CoinFlipGame[] = [
  {
    id: "cf-01",
    hash: "a7c91e2b0f4d88e1c3b9a012ff65d441",
    catalog: "mm2",
    status: "open",
    host: players[0],
    joiner: null,
    items: [catalogItems[1]],
    value: 900,
    ...(() => {
      const r = rangeAround(900);
      return { rangeMin: r.min, rangeMax: r.max };
    })(),
    createdAt: "2026-10-20T10:01:00.000Z",
  },
  {
    id: "cf-02",
    hash: "b2d40aa19c77ef0012a88bcd9911ee20",
    catalog: "mm2",
    status: "open",
    host: players[1],
    joiner: null,
    items: [catalogItems[2]],
    value: 350,
    rangeMin: 332,
    rangeMax: 368,
    createdAt: "2026-10-20T10:02:00.000Z",
  },
  {
    id: "cf-03",
    hash: "c9910022ab33cd44ee55ff6677889900",
    catalog: "mm2",
    status: "open",
    host: players[2],
    joiner: null,
    items: [catalogItems[3], catalogItems[11]],
    value: 98,
    rangeMin: 93,
    rangeMax: 103,
    createdAt: "2026-10-20T10:03:00.000Z",
  },
  {
    id: "cf-04",
    hash: "f7390a0bfff025a1beadd328d5b67d1c",
    catalog: "mm2",
    status: "full",
    host: players[6],
    joiner: players[3],
    items: [catalogItems[0]],
    value: 250,
    rangeMin: 238,
    rangeMax: 262,
    createdAt: "2026-10-20T09:55:00.000Z",
  },
  {
    id: "cf-05",
    hash: "d1e2f3a4b5c697887766554433221100",
    catalog: "mm2",
    status: "open",
    host: players[4],
    joiner: null,
    items: [catalogItems[4]],
    value: 160,
    rangeMin: 152,
    rangeMax: 168,
    createdAt: "2026-10-20T10:04:00.000Z",
  },
  {
    id: "cf-06",
    hash: "11223344556677889900aabbccddeeff",
    catalog: "mm2",
    status: "open",
    host: players[5],
    joiner: null,
    items: [catalogItems[6]],
    value: 27,
    rangeMin: 25,
    rangeMax: 29,
    createdAt: "2026-10-20T10:05:00.000Z",
  },
  {
    id: "cf-07",
    hash: "99887766554433221100ffeeddccbbaa",
    catalog: "mm2",
    status: "open",
    host: players[7],
    joiner: null,
    items: [catalogItems[7]],
    value: 23,
    rangeMin: 21,
    rangeMax: 25,
    createdAt: "2026-10-20T10:06:00.000Z",
  },
  {
    id: "cf-08",
    hash: "0f1e2d3c4b5a69788796a5b4c3d2e1f0",
    catalog: "mm2",
    status: "open",
    host: players[0],
    joiner: null,
    items: [catalogItems[8]],
    value: 16,
    rangeMin: 15,
    rangeMax: 17,
    createdAt: "2026-10-20T10:07:00.000Z",
  },
  {
    id: "cf-09",
    hash: "abcdef0123456789fedcba9876543210",
    catalog: "mm2",
    status: "open",
    host: players[1],
    joiner: null,
    items: [catalogItems[9]],
    value: 13,
    rangeMin: 12,
    rangeMax: 14,
    createdAt: "2026-10-20T10:08:00.000Z",
  },
  {
    id: "cf-10",
    hash: "55aa66bb77cc88dd99ee00ff11223344",
    catalog: "mm2",
    status: "ended",
    host: players[2],
    joiner: players[4],
    items: [catalogItems[13], catalogItems[5]],
    value: 2340,
    rangeMin: 2223,
    rangeMax: 2457,
    createdAt: "2026-10-20T09:40:00.000Z",
  },
];

export const jackpotRound: JackpotRound = {
  catalog: "mm2",
  pot: 1840,
  secondsLeft: 87,
  duration: 120,
  entries: [
    {
      id: "jp-1",
      player: players[0],
      items: [catalogItems[1]],
      value: 900,
      chance: 48.9,
    },
    {
      id: "jp-2",
      player: players[5],
      items: [catalogItems[5]],
      value: 540,
      chance: 29.3,
    },
    {
      id: "jp-3",
      player: players[3],
      items: [catalogItems[0]],
      value: 250,
      chance: 13.6,
    },
    {
      id: "jp-4",
      player: players[7],
      items: [catalogItems[4]],
      value: 150,
      chance: 8.2,
    },
  ],
};

export const upgraderItems: readonly UpgraderItem[] = [
  { id: "u1", name: "Ember Scythe", value: 4000, tone: "amber" },
  { id: "u2", name: "Ember Bow", value: 3000, tone: "amber" },
  { id: "u3", name: "Night Circuit Blade", value: 1800, tone: "violet" },
  { id: "u4", name: "Vale Compass", value: 540, tone: "cyan" },
  { id: "u5", name: "Harvester", value: 250, tone: "lime" },
  { id: "u6", name: "Northglass Lantern", value: 240, tone: "cyan" },
  { id: "u7", name: "Quiet Mantle", value: 160, tone: "slate" },
  { id: "u8", name: "Ash Key", value: 150, tone: "slate" },
  { id: "u9", name: "Tide Seal", value: 120, tone: "cyan" },
  { id: "u10", name: "Circuit Ledger", value: 55, tone: "violet" },
  { id: "u11", name: "Long Room Pennant", value: 35, tone: "rose" },
  { id: "u12", name: "Pool Notes", value: 28, tone: "cyan" },
];

export const liveWins: readonly LiveWin[] = [
  { id: "lw1", player: "NovaSeat", from: 14, gain: 4, to: 18, multiplier: 1.29, fromTone: "cyan", toTone: "lime" },
  { id: "lw2", player: "TideMark", from: 17, gain: 3, to: 20, multiplier: 1.18, fromTone: "violet", toTone: "amber" },
  { id: "lw3", player: "AshRail", from: 900, gain: 175, to: 1075, multiplier: 1.19, fromTone: "amber", toTone: "amber" },
  { id: "lw4", player: "QuietAnte", from: 10, gain: 7, to: 17, multiplier: 1.7, fromTone: "slate", toTone: "cyan" },
  { id: "lw5", player: "CircuitLynx", from: 8, gain: 2, to: 10, multiplier: 1.25, fromTone: "rose", toTone: "violet" },
  { id: "lw6", player: "HarborWick", from: 136, gain: 58, to: 194, multiplier: 1.43, fromTone: "cyan", toTone: "lime" },
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
  { id: "c2", user: "TideMark", text: "Demo values only — no live wagers.", at: "12:02" },
  { id: "c3", user: "AshRail", text: "Checking the upgrader list.", at: "12:03" },
  { id: "c4", user: "CircuitLynx", text: "Race podium is mock data.", at: "12:04" },
  { id: "c5", user: "HarborWick", text: "Join opens a demo notice.", at: "12:05" },
];

export const historyEntries: readonly HistoryEntry[] = [
  {
    id: "h1",
    mode: "coinflip",
    summary: "Viewed Harvester match",
    value: 250,
    at: "11:40",
    outcome: "viewed",
  },
  {
    id: "h2",
    mode: "jackpot",
    summary: "Joined demo pot",
    value: 540,
    at: "11:22",
    outcome: "lost",
  },
  {
    id: "h3",
    mode: "upgrader",
    summary: "Previewed Ember Bow upgrade",
    value: 3000,
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

export function getCoinFlipById(id: string): CoinFlipGame | undefined {
  return coinFlipGames.find((game) => game.id === id);
}
