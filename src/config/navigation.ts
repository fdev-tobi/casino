export type ModeLink = {
  href: string;
  label: string;
  id: "coinflip" | "jackpot" | "upgrader" | "values" | "race" | "leaderboard";
};

export const gameModes: readonly ModeLink[] = [
  { id: "coinflip", href: "/", label: "CoinFlip" },
  { id: "jackpot", href: "/jackpot", label: "JackPot" },
  { id: "upgrader", href: "/upgrader", label: "UPGRADER" },
  { id: "values", href: "/values", label: "Values" },
  { id: "race", href: "/race", label: "RACE" },
  { id: "leaderboard", href: "/leaderboard", label: "Leaderboard" },
];

export const footerLegal = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/responsible-use", label: "Responsible use" },
] as const;
