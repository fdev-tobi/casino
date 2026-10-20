export type GameCatalog = "adoptme";

export type CoinFlipStatus = "open" | "full" | "ended";

export type DemoItem = {
  id: string;
  name: string;
  value: number;
  tone: "amber" | "violet" | "cyan" | "rose" | "lime" | "slate";
  imageUrl?: string | null;
};

export type DemoPlayer = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type CoinFlipGame = {
  id: string;
  hash: string;
  catalog: GameCatalog;
  status: CoinFlipStatus;
  host: DemoPlayer;
  joiner: DemoPlayer | null;
  items: readonly DemoItem[];
  value: number;
  rangeMin: number;
  rangeMax: number;
  createdAt: string;
};

export type JackpotEntry = {
  id: string;
  player: DemoPlayer;
  items: readonly DemoItem[];
  value: number;
  chance: number;
};

export type JackpotRound = {
  catalog: GameCatalog;
  pot: number;
  secondsLeft: number;
  duration: number;
  entries: readonly JackpotEntry[];
};

export type UpgraderItem = {
  id: string;
  name: string;
  value: number;
  tone: DemoItem["tone"];
  imageUrl?: string | null;
};

export type LiveWin = {
  id: string;
  player: string;
  from: number;
  gain: number;
  to: number;
  multiplier: number;
  fromTone: DemoItem["tone"];
  toTone: DemoItem["tone"];
};

export type RaceStanding = {
  rank: number;
  player: DemoPlayer;
  wagered: number;
  prize: number;
};

export type RaceBoard = {
  prizePool: number;
  endsInSeconds: number;
  standings: readonly RaceStanding[];
};

export type LeaderboardRow = {
  rank: number;
  player: DemoPlayer;
  wins: number;
  profit: number;
};

export type ChatMessage = {
  id: string;
  user: string;
  text: string;
  at: string;
};

export type HistoryEntry = {
  id: string;
  mode: "coinflip" | "jackpot" | "upgrader" | "race";
  summary: string;
  value: number;
  at: string;
  outcome: "won" | "lost" | "viewed";
};
