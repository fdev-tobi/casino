"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { CoinSide } from "@/types/lobby";

const FRAME_PX = 400;
/** Full sprite walk once — slower than chroma default (~0.9s). */
export const COIN_FLIP_DURATION_MS = 1800;
const FLIP_STEPS = 68;
/** Horizontal strip: 68 steps × 400px. */
const END_OFFSET_PX = -27_200;

const SHEET: Record<CoinSide, string> = {
  heads: "/sprites/heads.png",
  tails: "/sprites/tails.png",
};

const MEDALLION: Record<CoinSide, string> = {
  heads: "/sprites/coin-heads.png",
  tails: "/sprites/coin-tails.png",
};

const sizeClass = {
  sm: "h-16 w-16 [--cf-coin-scale:0.2]",
  md: "h-40 w-40 [--cf-coin-scale:0.4] sm:h-56 sm:w-56 sm:[--cf-coin-scale:0.56]",
  /** Match view — large coin between seats. */
  lg: "h-56 w-56 [--cf-coin-scale:0.56] sm:h-72 sm:w-72 sm:[--cf-coin-scale:0.72]",
} as const;

/**
 * Sprite-sheet coin between match seats.
 * After the flip, the last animation frame stays on screen (no H/T medallion swap).
 */
export function CoinFlipCoin({
  spinning = false,
  flipStartedAt = null,
  resultSide = "heads",
  size = "lg",
  className,
}: {
  spinning?: boolean;
  /** Epoch ms when join completed / flip began. */
  flipStartedAt?: number | null;
  /** Winning side — selects the sprite sheet that ends on that face. */
  resultSide?: CoinSide;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!spinning || !flipStartedAt) return;
    const elapsed = Date.now() - flipStartedAt;
    if (elapsed >= COIN_FLIP_DURATION_MS) {
      setNow(Date.now());
      return;
    }
    setNow(Date.now());
    const timer = window.setTimeout(() => setNow(Date.now()), COIN_FLIP_DURATION_MS - elapsed + 16);
    return () => window.clearTimeout(timer);
  }, [spinning, flipStartedAt]);

  const elapsed = flipStartedAt ? Math.max(0, now - flipStartedAt) : 0;
  const isFlipping = Boolean(spinning && flipStartedAt && elapsed < COIN_FLIP_DURATION_MS);
  const showEnd = Boolean(spinning && flipStartedAt && elapsed >= COIN_FLIP_DURATION_MS);

  // Waiting for a join: medallion only. Once a flip runs, stay on the sprite
  // (including the final frame after it stops).
  if (!isFlipping && !showEnd) {
    return (
      <span
        className={cn("relative block shrink-0 overflow-visible", sizeClass[size], className)}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MEDALLION[resultSide]}
          alt=""
          className="size-full object-contain"
          draggable={false}
        />
      </span>
    );
  }

  const style: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 10,
    width: FRAME_PX,
    height: FRAME_PX,
    backgroundImage: `url("${SHEET[resultSide]}")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: showEnd ? `${END_OFFSET_PX}px 0` : "0 0",
    transform: "translate(-50%, -50%) scale(var(--cf-coin-scale, 0.56))",
  };

  if (isFlipping) {
    Object.assign(style, {
      animationName: "cf-coin-flip-sheet",
      animationDuration: `${COIN_FLIP_DURATION_MS}ms`,
      animationTimingFunction: `steps(${FLIP_STEPS}, end)`,
      animationIterationCount: 1,
      animationFillMode: "forwards",
      animationDelay: `-${Math.min(elapsed, COIN_FLIP_DURATION_MS - 1)}ms`,
    } satisfies CSSProperties);
  }

  return (
    <span
      className={cn("relative block shrink-0 overflow-visible", sizeClass[size], className)}
      aria-hidden="true"
    >
      <div data-coin-sprite className="pointer-events-none" style={style} />
    </span>
  );
}
