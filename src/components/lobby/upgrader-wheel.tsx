"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";

const SPIN_MS = 4200;

/** Angle in degrees from 12 o'clock, clockwise, 0–360. */
function angleFromPointer(clientX: number, clientY: number, el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

function normalizeDeg(value: number): number {
  return ((value % 360) + 360) % 360;
}

/**
 * Whether the fixed top pointer (angle 0) sits inside the win arc after `offset`
 * rotation of the wheel. Blue arc in local space is `[0, winDegrees)` from top CW;
 * after `rotate(offset)` it covers screen angles `[offset, offset + winDegrees)`.
 */
export function isPointerInWinZone(offset: number, winDegrees: number): boolean {
  const span = Math.max(0, Math.min(360, winDegrees));
  if (span <= 0) return false;
  if (span >= 360) return true;
  // Local angle under the tip: rotate(offset) maps local L → screen offset+L.
  // Screen 0 ⇒ local = -offset.
  const localUnderPointer = normalizeDeg(-offset);
  return localUnderPointer < span;
}

/** Pick a final wheel offset so the top pointer is inside (win) or outside (miss) the blue arc. */
function offsetForOutcome(wantWin: boolean, winDegrees: number): number {
  const span = Math.max(0, Math.min(360, winDegrees));
  if (span <= 0) return Math.random() * 360;
  if (span >= 360) return Math.random() * 360;
  if (wantWin) {
    // Pointer at 0 is `t` degrees into the zone ⇒ offset = -t.
    const t = Math.random() * span;
    return normalizeDeg(-t);
  }
  const loseSpan = 360 - span;
  // Zone starts just after 0 so 0 is outside: offset ∈ (0, loseSpan].
  const t = Math.random() * loseSpan;
  return normalizeDeg(t + 0.0001);
}

function winZoneBackground(winDegrees: number): string {
  const span = Math.max(0, Math.min(360, winDegrees));
  const lose = "#2a2d3a";
  const win = "var(--primary)";

  // CSS conic 0deg is already at 12 o'clock (top), clockwise — must match the
  // fixed pointer + isPointerInWinZone math (local 0 = top under the tip).
  if (span <= 0) {
    return `conic-gradient(from 0deg, ${lose} 0deg 360deg)`;
  }
  if (span >= 360) {
    return `conic-gradient(from 0deg, ${win} 0deg 360deg)`;
  }

  // Zone painted from 0° (top) clockwise for `span` degrees in local wheel space.
  // The whole layer is rotated by `wheelAngle`, so aiming + spin move the blue arc.
  return `conic-gradient(from 0deg, ${win} 0deg ${span}deg, ${lose} ${span}deg 360deg)`;
}

export function UpgraderWheel({
  chance,
  spinning,
  spinKey = 0,
  onSpinEnd,
}: {
  /** Win chance 0–100. */
  chance: number;
  spinning: boolean;
  /** Increments each upgrade so consecutive spins re-run. */
  spinKey?: number;
  /** Called after the wheel fully stops. `won` = pointer over blue. */
  onSpinEnd?: (won: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastPointerAngle = useRef<number | null>(null);
  const onSpinEndRef = useRef(onSpinEnd);
  onSpinEndRef.current = onSpinEnd;

  /** Aim rotation of the wheel (blue arc start angle from top, CW). */
  const [aimOffset, setAimOffset] = useState(0);
  const aimOffsetRef = useRef(0);
  aimOffsetRef.current = aimOffset;

  /** Absolute wheel rotation including spin turns (for CSS transform). */
  const [wheelAngle, setWheelAngle] = useState(0);
  const wheelAngleRef = useRef(0);
  wheelAngleRef.current = wheelAngle;

  const [wheelTransition, setWheelTransition] = useState<string>("none");
  const [settled, setSettled] = useState(false);
  const [displayWon, setDisplayWon] = useState<boolean | null>(null);

  const winDegrees = Math.max(0, Math.min(100, chance)) * 3.6;
  const winDegreesRef = useRef(winDegrees);
  winDegreesRef.current = winDegrees;
  const chanceRef = useRef(chance);
  chanceRef.current = chance;

  // Keep wheelAngle aligned with aim while idle so drag feels direct.
  useEffect(() => {
    if (spinning) return;
    setWheelTransition("none");
    setWheelAngle(aimOffset);
    wheelAngleRef.current = aimOffset;
  }, [aimOffset, spinning]);

  // Document-level move/up so aim works even if the pointer leaves the wheel.
  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!dragging.current || spinning) return;
      const el = rootRef.current;
      if (!el) return;
      const angle = angleFromPointer(event.clientX, event.clientY, el);
      if (lastPointerAngle.current === null) {
        lastPointerAngle.current = angle;
        return;
      }
      let delta = angle - lastPointerAngle.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      lastPointerAngle.current = angle;
      setAimOffset((value) => normalizeDeg(value + delta));
    }

    function onUp() {
      dragging.current = false;
      lastPointerAngle.current = null;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [spinning]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (spinning) return;
    event.preventDefault();
    dragging.current = true;
    lastPointerAngle.current = angleFromPointer(event.clientX, event.clientY, event.currentTarget);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  // Spin the wheel under a fixed top pointer. Outcome matches blue-under-pointer.
  useEffect(() => {
    if (!spinning) return;

    setSettled(false);
    setDisplayWon(null);
    setWheelTransition("none");

    const span = winDegreesRef.current;
    const rolledWin = Math.random() * 100 < chanceRef.current;
    const finalOffset = offsetForOutcome(rolledWin, span);
    // Geometry is source of truth so the label always matches blue-under-pointer.
    const outcome = isPointerInWinZone(finalOffset, span);

    const current = wheelAngleRef.current;
    const turns = 6 + Math.floor(Math.random() * 2);
    let delta = normalizeDeg(finalOffset - normalizeDeg(current));
    if (delta < 45) delta += 360;
    const next = current + turns * 360 + delta;

    // Lock aim to the landing offset so after spin the wheel stays put.
    aimOffsetRef.current = finalOffset;
    setAimOffset(finalOffset);

    const frame = window.requestAnimationFrame(() => {
      setWheelTransition(`transform ${SPIN_MS}ms cubic-bezier(0.08, 0.82, 0.08, 1)`);
      setWheelAngle(next);
      wheelAngleRef.current = next;
    });

    const timer = window.setTimeout(() => {
      setSettled(true);
      setDisplayWon(outcome);
      onSpinEndRef.current?.(outcome);
      // Snap stored angle into 0–360 range matching aim.
      setWheelTransition("none");
      setWheelAngle(finalOffset);
      wheelAngleRef.current = finalOffset;
    }, SPIN_MS + 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [spinning, spinKey]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex size-52 items-center justify-center select-none sm:size-60",
        !spinning && "cursor-grab active:cursor-grabbing",
        spinning && "cursor-default",
      )}
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      role="slider"
      aria-label="Drag to aim win zone"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(aimOffset)}
      tabIndex={0}
      onKeyDown={(event) => {
        if (spinning) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          setAimOffset((value) => normalizeDeg(value + 8));
        }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          setAimOffset((value) => normalizeDeg(value - 8));
        }
      }}
    >
      <div
        className="relative size-full rounded-full p-[3px] shadow-[0_0_40px_rgba(84,104,241,0.18)]"
        style={{
          background: "linear-gradient(145deg, rgba(84,104,241,0.55), rgba(34,36,47,0.9))",
        }}
      >
        <div
          className="relative size-full overflow-hidden rounded-full"
          style={{
            background: winZoneBackground(winDegrees),
            transform: `rotate(${wheelAngle}deg)`,
            transition: wheelTransition,
          }}
        >
          <div className="pointer-events-none absolute inset-[14%] rounded-full border border-white/5 bg-[#121218]" />
        </div>
      </div>

      {/* Fixed result pointer at 12 o'clock — win = blue under this tip. */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 z-30 -translate-x-1/2 -translate-y-0.5"
        aria-hidden="true"
      >
        <div
          className={cn(
            "h-0 w-0 border-x-[7px] border-t-[12px] border-x-transparent border-t-white/90 drop-shadow",
            settled && displayWon === true && "border-t-primary",
            settled && displayWon === false && "border-t-rose-400",
          )}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <div
          className={cn(
            "text-center transition duration-300",
            spinning && !settled && "scale-95 opacity-80",
            settled && displayWon === true && "scale-105",
          )}
        >
          <p className="text-3xl font-bold tabular-nums sm:text-4xl">{chance.toFixed(2)}%</p>
          <p className="mt-1 max-w-[9.5rem] text-[0.7rem] leading-4 text-white/45">
            {spinning && !settled ? "Rolling…" : "Drag to aim"}
          </p>
          {settled && displayWon !== null ? (
            <p
              className={cn(
                "mt-2 text-sm font-bold uppercase tracking-wide",
                displayWon ? "text-primary" : "text-rose-400",
              )}
            >
              {displayWon ? "Won" : "Miss"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
