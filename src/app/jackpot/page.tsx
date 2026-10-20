import type { Metadata } from "next";

import { JackpotPanel } from "@/components/lobby/jackpot-panel";

export const metadata: Metadata = { title: "JackPot" };

export default function JackpotPage() {
  return <JackpotPanel />;
}
