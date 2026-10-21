"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

const FRAME_PX = 400;
/** Full sprite walk once — slower than chroma default (~0.9s). */
export const COIN_FLIP_DURATION_MS = 1800;
const FLIP_STEPS = 68;
const END_OFFSET_PX = -27200;

const sizeClass = {
  sm: "h-16 w-16 [--cf-coin-scale:0.2]",
  md: "h-36 w-36 [--cf-coin-scale:0.36] sm:h-52 sm:w-52 sm:[--cf-coin-scale:0.52]",
  lg: "h-44 w-44 [--cf-coin-scale:0.44] sm:h-60 sm:w-60 sm:[--cf-coin-scale:0.6]",
} as const;

/**
 * Sprite-sheet coin between match seats (`/sprites/tails.png`, 69×400px frames).
 * When `flipStartedAt` is set, the animation is synced to that timestamp so View
 * does not restart the flip — it only plays from the moment join completed.
 */
export function CoinFlipCoin({
  spinning = false,
  flipStartedAt = null,
  size = "lg",
  className,
}: {
  spinning?: boolean;
  /** Epoch ms when join completed / flip began. */
  flipStartedAt?: number | null;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const style = useMemo(() => {
    const base = {
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      zIndex: 10,
      width: FRAME_PX,
      height: FRAME_PX,
      backgroundImage: 'url("/sprites/tails.png")',
      backgroundRepeat: "no-repeat" as const,
      transform: "translate(-50%, -50%) scale(var(--cf-coin-scale, 0.44))",
    };

    if (!spinning || !flipStartedAt) {
      return { ...base, backgroundPosition: "0 0" };
    }

    const elapsed = Date.now() - flipStartedAt;
    if (elapsed >= COIN_FLIP_DURATION_MS) {
      return {
        ...base,
        backgroundPosition: `0 ${END_OFFSET_PX}px`,
      };
    }

    return {
      ...base,
      backgroundPosition: "0 0",
      animationName: "cf-coin-flip-sheet",
      animationDuration: `${COIN_FLIP_DURATION_MS}ms`,
      animationTimingFunction: `steps(${FLIP_STEPS}, end)`,
      animationIterationCount: 1,
      animationFillMode: "forwards" as const,
      animationDelay: `-${Math.max(0, elapsed)}ms`,
    };
  }, [spinning, flipStartedAt]);

  return (
    <span className={cn("relative block", sizeClass[size], className)} aria-hidden="true">
      <div data-coin-sprite className="pointer-events-none" style={style} />
    </span>
  );
}
