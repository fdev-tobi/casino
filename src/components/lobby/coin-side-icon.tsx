"use client";

import { cn } from "@/lib/utils";
import type { CoinSide } from "@/types/lobby";

const SRC: Record<CoinSide, string> = {
  heads: "/sprites/coin-heads.png",
  tails: "/sprites/coin-tails.png",
};

export function CoinSideIcon({
  side,
  className,
  alt,
}: {
  side: CoinSide;
  className?: string;
  alt?: string;
}) {
  return (
    // Static public assets — plain img keeps black background crisp without Next optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC[side]}
      alt={alt ?? (side === "heads" ? "Heads" : "Tails")}
      draggable={false}
      className={cn("pointer-events-none select-none object-contain", className)}
    />
  );
}
