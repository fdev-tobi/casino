import type { Metadata } from "next";

import { RacePanel } from "@/components/lobby/race-panel";

export const metadata: Metadata = { title: "RACE" };

export default function RacePage() {
  return <RacePanel />;
}
