import type { Metadata } from "next";

import { UpgraderPanel } from "@/components/lobby/upgrader-panel";

export const metadata: Metadata = { title: "UPGRADER" };

export default function UpgraderPage() {
  return <UpgraderPanel />;
}
