"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const SPIN_MS = 4200;

export function UpgraderWheel({
  chance,
  spinning,
  won,
  onSpinEnd,
}: {
  /** Win chance 0–100. */
  chance: number;
  spinning: boolean;
  /** Predetermined outcome for the current spin. */
  won: boolean | null;
  onSpinEnd?: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [settled, setSettled] = useState(false);
  const onSpinEndRef = useRef(onSpinEnd);
  onSpinEndRef.current = onSpinEnd;

  const winDegrees = Math.max(0, Math.min(100, chance)) * 3.6;

  useEffect(() => {
    if (!spinning || won === null) return;

    setSettled(false);

    // Needle is fixed at top. Win arc starts at 12 o'clock and runs clockwise.
    const winMid = Math.max(2, winDegrees / 2);
    const loseSpan = Math.max(2, 360 - winDegrees);
    const loseMid = winDegrees + loseSpan / 2;
    const targetInCircle = won ? winMid : loseMid;
    const turns = 5 + Math.floor(Math.random() * 2);
    const next = turns * 360 + ((360 - targetInCircle) % 360);

    const frame = window.requestAnimationFrame(() => {
      setRotation(next);
    });

    const timer = window.setTimeout(() => {
      setSettled(true);
      onSpinEndRef.current?.();
    }, SPIN_MS + 40);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [spinning, won, winDegrees]);

  return (
    <div className="relative flex size-52 items-center justify-center sm:size-60">
      <div
        className="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-0.5"
        aria-hidden="true"
      >
        <div className="h-0 w-0 border-x-[8px] border-t-[14px] border-x-transparent border-t-primary drop-shadow" />
      </div>

      <div
        className="relative size-full rounded-full p-[3px] shadow-[0_0_40px_rgba(84,104,241,0.18)]"
        style={{
          background: "linear-gradient(145deg, rgba(84,104,241,0.55), rgba(34,36,47,0.9))",
        }}
      >
        <div
          className="relative size-full overflow-hidden rounded-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.12, 1)`
              : "none",
            background: `conic-gradient(from -90deg, var(--primary) 0deg ${winDegrees}deg, #2a2d3a ${winDegrees}deg 360deg)`,
          }}
        >
          <div className="absolute inset-[14%] rounded-full border border-white/5 bg-[#121218]" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <div
          className={cn(
            "text-center transition duration-300",
            spinning && !settled && "scale-95 opacity-80",
            settled && won === true && "scale-105",
          )}
        >
          <p className="text-3xl font-bold tabular-nums sm:text-4xl">{chance.toFixed(2)}%</p>
          <p className="mt-1 max-w-[9.5rem] text-[0.7rem] leading-4 text-white/45">
            Chance of receiving selected items
          </p>
          {settled && won !== null ? (
            <p
              className={cn(
                "mt-2 text-sm font-bold uppercase tracking-wide",
                won ? "text-primary" : "text-rose-400",
              )}
            >
              {won ? "Won" : "Miss"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
