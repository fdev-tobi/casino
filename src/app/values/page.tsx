import type { Metadata } from "next";

import { ValuesPanel } from "@/components/lobby/values-panel";

export const metadata: Metadata = { title: "Values" };

export default function ValuesPage() {
  return <ValuesPanel />;
}
