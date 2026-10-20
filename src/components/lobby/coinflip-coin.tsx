"use client";

import { cn } from "@/lib/utils";

const FRAME_PX = 400;

const sizeClass = {
  sm: "h-14 w-14 [--cf-coin-scale:0.16]",
  md: "h-24 w-24 [--cf-coin-scale:0.24] sm:h-48 sm:w-48 sm:[--cf-coin-scale:0.48]",
  lg: "h-32 w-32 [--cf-coin-scale:0.32] sm:h-48 sm:w-48 sm:[--cf-coin-scale:0.48]",
} as const;

/**
 * Sprite-sheet coin between match seats (`/sprites/tails.png`, 69×400px frames).
 * Plays `animate-coinflip` when both seats are filled.
 *
 * Markup mirrors chroma:
 * `<span class="relative h-24…"><div class="… animate-coinflip" style="background:url(/sprites/tails.png);width:400px;height:400px" /></span>`
 */
export function CoinFlipCoin({
  spinning = false,
  size = "md",
  className,
}: {
  spinning?: boolean;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  return (
    <span className={cn("relative block", sizeClass[size], className)} aria-hidden="true">
      <div
        data-coin-sprite
        className={cn("pointer-events-none", spinning ? "animate-coinflip" : "cf-coin-static")}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          zIndex: 10,
          width: FRAME_PX,
          height: FRAME_PX,
          backgroundImage: 'url("/sprites/tails.png")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: spinning ? undefined : "0 0",
          transform: "translate(-50%, -50%) scale(var(--cf-coin-scale, 0.24))",
        }}
      />
    </span>
  );
}
