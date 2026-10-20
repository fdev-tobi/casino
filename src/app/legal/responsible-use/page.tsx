import type { Metadata } from "next";

import { ProsePage } from "@/components/layout/prose-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Responsible use" };

export default function ResponsibleUsePage() {
  return (
    <ProsePage eyebrow="Boundary" title="Responsible use">
      <p>
        {brand.name} is a demonstration interface. Join, Create, Upgrade, and similar controls do not take deposits,
        process withdrawals, run a wager, or transfer items of value.
      </p>
      <p>
        Stats, match lists, jackpot pots, live wins, and race standings are mock records for layout and interaction
        review.
      </p>
      <p>
        A future version that involves real-money gaming or transferable value would need the operator&apos;s licensing
        position, the relevant jurisdictional rules, age checks, and a security review before that behavior is
        implemented.
      </p>
    </ProsePage>
  );
}
