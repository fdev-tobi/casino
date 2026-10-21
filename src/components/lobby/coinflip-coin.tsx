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

/** Resting art is ~128px inside the 400px frame — same for H and T. */
const END_ART_PX = 128;

const BOX_PX = {
  sm: 64,
  md: 112,
  lg: 120,
} as const;

/**
 * Both sheets share the same flip motion (frames 0–59).
 * Frames 60–68 hold the result face — heads strip ends on H, tails on T.
 * Same frame count, duration, steps, and CSS scale for both.
 */
const SHEET: Record<CoinSide, string> = {
  heads: "/sprites/heads.png?v=9",
  tails: "/sprites/tails.png?v=9",
};

const sizeClass = {
  sm: "h-16 w-16",
  md: "h-28 w-28",
  lg: "h-[7.5rem] w-[7.5rem]",
} as const;

/**
 * Sprite-sheet coin between match seats.
 * Heads and tails use identical flip timing; only the settled face differs.
 */
export function CoinFlipCoin({
  spinning = false,
  flipStartedAt = null,
  resultSide = "heads",
  size = "lg",
  className,
}: {
  spinning?: boolean;
  flipStartedAt?: number | null;
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
  const showEnd = Boolean(flipStartedAt && elapsed >= COIN_FLIP_DURATION_MS);
  const scale = BOX_PX[size] / END_ART_PX;

  const style: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 10,
    width: FRAME_PX,
    height: FRAME_PX,
    backgroundImage: `url("${SHEET[resultSide]}")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: showEnd || !isFlipping ? `${END_OFFSET_PX}px 0` : "0 0",
    transform: `translate(-50%, -50%) scale(${scale})`,
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
