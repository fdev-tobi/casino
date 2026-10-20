"use client";

import { cn } from "@/lib/utils";

export function CoinFlipCoin({
  spinning = false,
  className,
}: {
  spinning?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex h-20 w-48 items-center justify-center sm:h-24 sm:w-56",
        className,
      )}
      aria-hidden="true"
    >
      <span className="cf-coin-glow absolute inset-[-40%] rounded-full" />
      <span className={cn("cf-coin-stage relative h-14 w-44 sm:h-16 sm:w-52", spinning && "cf-coin-spinning")}>
        <span className="cf-coin absolute inset-0 rounded-[999px]" />
        <span className="cf-coin-rim absolute inset-0 rounded-[999px]" />
        <span className="cf-coin-flare absolute inset-y-[-40%] left-1/2 w-[20%] -translate-x-1/2" />
      </span>
    </div>
  );
}
