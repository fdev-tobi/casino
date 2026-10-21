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

/**
 * Resting art size differs per sheet (heads last frame is larger than tails).
 * Scale each side so the final face matches BOX_PX.
 */
const END_ART_PX: Record<CoinSide, number> = {
  heads: 158,
  tails: 130,
};

const BOX_PX = {
  sm: 64,
  md: 112,
  lg: 120,
} as const;

const SHEET: Record<CoinSide, string> = {
  heads: "/sprites/heads.png",
  tails: "/sprites/tails.png",
};

const sizeClass = {
  sm: "h-16 w-16",
  md: "h-28 w-28",
  /** Match modal — same visual size for heads and tails end frames. */
  lg: "h-[7.5rem] w-[7.5rem]",
} as const;

/**
 * Sprite-sheet coin between match seats.
 * Only mounted once both players have joined and a flip has started.
 * After the flip, the last animation frame stays on screen.
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
  const showEnd = Boolean(flipStartedAt && elapsed >= COIN_FLIP_DURATION_MS);
  const scale = BOX_PX[size] / END_ART_PX[resultSide];

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
