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

/** Whether `angle` (0–360 from top, CW) sits inside the win arc. */
export function isAngleInWinZone(angle: number, offset: number, winDegrees: number): boolean {
  const span = Math.max(0, Math.min(360, winDegrees));
  if (span <= 0) return false;
  if (span >= 360) return true;
  const a = normalizeDeg(angle);
  const start = normalizeDeg(offset);
  const end = start + span;
  if (end <= 360) {
    return a >= start && a < end;
  }
  // Wraps past 360°.
  return a >= start || a < end - 360;
}

function winZoneBackground(offset: number, winDegrees: number): string {
  const start = normalizeDeg(offset);
  const span = Math.max(0, Math.min(360, winDegrees));
  const lose = "#2a2d3a";
  const win = "var(--primary)";

  if (span <= 0) {
    return `conic-gradient(from -90deg, ${lose} 0deg 360deg)`;
  }
  if (span >= 360) {
    return `conic-gradient(from -90deg, ${win} 0deg 360deg)`;
  }

  const end = start + span;
  if (end <= 360) {
    return `conic-gradient(from -90deg, ${lose} 0deg ${start}deg, ${win} ${start}deg ${end}deg, ${lose} ${end}deg 360deg)`;
  }

  const wrapEnd = end - 360;
  return `conic-gradient(from -90deg, ${win} 0deg ${wrapEnd}deg, ${lose} ${wrapEnd}deg ${start}deg, ${win} ${start}deg 360deg)`;
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
  /** Called after the marker fully stops. `won` matches the visual land zone. */
  onSpinEnd?: (won: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastPointerAngle = useRef<number | null>(null);
  const onSpinEndRef = useRef(onSpinEnd);
  onSpinEndRef.current = onSpinEnd;

  const [zoneOffset, setZoneOffset] = useState(0);
  const zoneOffsetRef = useRef(0);
  zoneOffsetRef.current = zoneOffset;

  const [markerAngle, setMarkerAngle] = useState(0);
  const markerAngleRef = useRef(0);
  markerAngleRef.current = markerAngle;

  const [markerTransition, setMarkerTransition] = useState<string>("none");
  const [settled, setSettled] = useState(false);
  const [displayWon, setDisplayWon] = useState<boolean | null>(null);

  const winDegrees = Math.max(0, Math.min(100, chance)) * 3.6;
  const winDegreesRef = useRef(winDegrees);
  winDegreesRef.current = winDegrees;

  // Document-level move/up so aim works on desktop + mobile even if the pointer leaves the wheel.
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
      setZoneOffset((value) => normalizeDeg(value + delta));
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

  // Spin: land somewhere random, then derive won from the visual zone (no mismatch).
  useEffect(() => {
    if (!spinning) return;

    setSettled(false);
    setDisplayWon(null);
    setMarkerTransition("none");

    const offset = zoneOffsetRef.current;
    const span = winDegreesRef.current;
    const landAt = Math.random() * 360;
    const won = isAngleInWinZone(landAt, offset, span);

    const current = normalizeDeg(markerAngleRef.current);
    const turns = 6 + Math.floor(Math.random() * 2);
    let delta = normalizeDeg(landAt - current);
    if (delta < 45) delta += 360;
    const next = markerAngleRef.current + turns * 360 + delta;

    const frame = window.requestAnimationFrame(() => {
      setMarkerTransition(`transform ${SPIN_MS}ms cubic-bezier(0.08, 0.82, 0.08, 1)`);
      setMarkerAngle(next);
    });

    const timer = window.setTimeout(() => {
      setSettled(true);
      setDisplayWon(won);
      onSpinEndRef.current?.(won);
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
      aria-valuenow={Math.round(zoneOffset)}
      tabIndex={0}
      onKeyDown={(event) => {
        if (spinning) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          setZoneOffset((value) => normalizeDeg(value + 8));
        }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          setZoneOffset((value) => normalizeDeg(value - 8));
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
          style={{ background: winZoneBackground(zoneOffset, winDegrees) }}
        >
          <div className="pointer-events-none absolute inset-[14%] rounded-full border border-white/5 bg-[#121218]" />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          transform: `rotate(${markerAngle}deg)`,
          transition: markerTransition,
        }}
        aria-hidden="true"
      >
        <div className="absolute top-1 left-1/2 -translate-x-1/2">
          <div
            className={cn(
              "size-3.5 rounded-full border-2 border-[#121218] bg-white shadow-[0_0_12px_rgba(255,255,255,0.55)] sm:size-4",
              settled && displayWon === true && "bg-primary shadow-[0_0_16px_rgba(84,104,241,0.8)]",
              settled && displayWon === false && "bg-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.65)]",
            )}
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute top-0 left-1/2 z-30 -translate-x-1/2 -translate-y-0.5"
        aria-hidden="true"
      >
        <div className="h-0 w-0 border-x-[7px] border-t-[12px] border-x-transparent border-t-white/90" />
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
