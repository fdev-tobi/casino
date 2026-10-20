import type { Metadata } from "next";

import { LeaderboardPanel } from "@/components/lobby/leaderboard-panel";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return <LeaderboardPanel />;
}
