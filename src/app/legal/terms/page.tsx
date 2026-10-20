import type { Metadata } from "next";

import { ProsePage } from "@/components/layout/prose-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <ProsePage eyebrow="Placeholder" title="Terms">
      <p>
        These terms are a presentation placeholder for {brand.name}. They do not create a contract for wagering,
        deposits, withdrawals, or item transfers.
      </p>
      <p>
        The lobby modes (CoinFlip, JackPot, Upgrader, Race, Leaderboard) use mock data for client review only.
      </p>
    </ProsePage>
  );
}
