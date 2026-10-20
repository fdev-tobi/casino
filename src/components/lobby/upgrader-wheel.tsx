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

function winZoneBackground(offset: number, winDegrees: number): string {
  const start = ((offset % 360) + 360) % 360;
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

  // Wraps past 360°: green at the end and again from 0.
  const wrapEnd = end - 360;
  return `conic-gradient(from -90deg, ${win} 0deg ${wrapEnd}deg, ${lose} ${wrapEnd}deg ${start}deg, ${win} ${start}deg 360deg)`;
}

export function UpgraderWheel({
  chance,
  spinning,
  won,
  spinKey = 0,
  onSpinEnd,
}: {
  /** Win chance 0–100. */
  chance: number;
  spinning: boolean;
  /** Predetermined outcome for the current spin. */
  won: boolean | null;
  /** Increments each upgrade so consecutive same outcomes still re-spin. */
  spinKey?: number;
  onSpinEnd?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const onSpinEndRef = useRef(onSpinEnd);
  onSpinEndRef.current = onSpinEnd;

  /** Where the win zone starts (clockwise from top). Mouse moves it. */
  const [zoneOffset, setZoneOffset] = useState(0);
  const zoneOffsetRef = useRef(0);
  zoneOffsetRef.current = zoneOffset;

  /** Marker angle on the rim (clockwise from top). */
  const [markerAngle, setMarkerAngle] = useState(0);
  const markerAngleRef = useRef(0);
  markerAngleRef.current = markerAngle;

  const [markerTransition, setMarkerTransition] = useState<string>("none");
  const [settled, setSettled] = useState(false);

  const winDegrees = Math.max(0, Math.min(100, chance)) * 3.6;
  const winDegreesRef = useRef(winDegrees);
  winDegreesRef.current = winDegrees;

  function moveZoneToPointer(clientX: number, clientY: number) {
    const el = rootRef.current;
    if (!el || spinning) return;
    const pointer = angleFromPointer(clientX, clientY, el);
    const next = (pointer - winDegreesRef.current / 2 + 360) % 360;
    setZoneOffset(next);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (spinning) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveZoneToPointer(event.clientX, event.clientY);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (spinning || !dragging.current) return;
    moveZoneToPointer(event.clientX, event.clientY);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!spinning || won === null) return;

    setSettled(false);
    setMarkerTransition("none");

    const offset = zoneOffsetRef.current;
    const span = winDegreesRef.current;
    const winStart = offset;
    const winEnd = offset + span;

    const pickInRange = (start: number, range: number) => {
      const safe = Math.max(1, range);
      return (start + Math.random() * safe) % 360;
    };

    let landAt: number;
    if (won) {
      landAt = pickInRange(winStart, Math.max(1, span));
    } else {
      landAt = pickInRange(winEnd, Math.max(1, 360 - span));
    }

    const current = markerAngleRef.current % 360;
    const turns = 6 + Math.floor(Math.random() * 2);
    let delta = (landAt - current + 360) % 360;
    if (delta < 40) delta += 360;
    const next = markerAngleRef.current + turns * 360 + delta;

    const frame = window.requestAnimationFrame(() => {
      setMarkerTransition(`transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.12, 1)`);
      setMarkerAngle(next);
    });

    const timer = window.setTimeout(() => {
      setSettled(true);
      onSpinEndRef.current?.();
    }, SPIN_MS + 40);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [spinning, won, spinKey]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex size-52 touch-none items-center justify-center select-none sm:size-60",
        !spinning && "cursor-grab active:cursor-grabbing",
        spinning && "cursor-default",
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="slider"
      aria-label="Move win zone around the wheel"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(zoneOffset)}
      tabIndex={0}
      onKeyDown={(event) => {
        if (spinning) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          setZoneOffset((value) => (value + 8) % 360);
        }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          setZoneOffset((value) => (value + 352) % 360);
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
          <div className="absolute inset-[14%] rounded-full border border-white/5 bg-[#121218]" />
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
              settled && won === true && "bg-primary shadow-[0_0_16px_rgba(84,104,241,0.8)]",
              settled && won === false && "bg-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.65)]",
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
            settled && won === true && "scale-105",
          )}
        >
          <p className="text-3xl font-bold tabular-nums sm:text-4xl">{chance.toFixed(2)}%</p>
          <p className="mt-1 max-w-[9.5rem] text-[0.7rem] leading-4 text-white/45">
            {spinning ? "Rolling…" : "Drag to aim"}
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
