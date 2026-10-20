"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/components/lobby/avatar";
import { ValueGem } from "@/components/lobby/value-gem";
import { formatClock, formatValue } from "@/lib/format";
import { raceBoard } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function RacePanel() {
  const [seconds, setSeconds] = useState(raceBoard.endsInSeconds);
  const clock = formatClock(seconds);
  const top = raceBoard.standings.slice(0, 3);
  const rest = raceBoard.standings.slice(3);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((current) => (current <= 0 ? raceBoard.endsInSeconds : current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const ordered = [top[1], top[0], top[2]].filter(Boolean);

  return (
    <div className="flex w-full flex-col gap-3 px-4 pt-3 pb-32">
      <section className="grid items-end gap-2 sm:grid-cols-3">
        {ordered.map((row) => {
          const isFirst = row.rank === 1;
          return (
            <article
              key={row.player.id}
              className={cn(
                "rounded border bg-card p-4 text-center",
                isFirst ? "border-primary sm:-translate-y-2" : "border-border",
              )}
            >
              <Avatar player={row.player} size="lg" className="mx-auto" />
              <p className="mt-3 text-sm font-semibold">#{row.rank}</p>
              <p className="mt-1 truncate text-sm font-medium">{row.player.name}</p>
              <ValueGem amount={row.prize} className="mt-3 justify-center text-primary" />
              <p className="mt-1 text-xs text-muted-foreground">{formatValue(row.wagered)} wagered</p>
            </article>
          );
        })}
      </section>

      <section className="rounded border bg-card p-4 text-center">
        <p className="text-xs font-semibold tracking-wide uppercase text-white/50">Prize pool</p>
        <ValueGem amount={raceBoard.prizePool} className="mt-2 justify-center text-3xl text-primary" />
        <div className="mt-4 grid grid-cols-4 gap-2 text-lg font-semibold">
          {[
            [clock.d, "D"],
            [clock.h, "H"],
            [clock.m, "M"],
            [clock.s, "S"],
          ].map(([value, label]) => (
            <div key={label as string} className="rounded border bg-card py-2">
              <p>{value}</p>
              <p className="text-xs font-medium text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded border bg-card">
        <div className="grid grid-cols-[3rem_1fr_1fr_1fr] gap-2 border-b px-4 py-2 text-xs font-semibold tracking-wide uppercase text-white/50">
          <span>#</span>
          <span>Username</span>
          <span className="text-right">Wagered</span>
          <span className="text-right">Prize</span>
        </div>
        <ul>
          {rest.map((row) => (
            <li
              key={row.player.id}
              className="grid grid-cols-[3rem_1fr_1fr_1fr] items-center gap-2 border-b border-border px-4 py-2 last:border-b-0"
            >
              <span className="text-sm text-muted-foreground">#{row.rank}</span>
              <span className="flex min-w-0 items-center gap-2">
                <Avatar player={row.player} size="sm" />
                <span className="truncate text-sm font-medium">{row.player.name}</span>
              </span>
              <span className="text-right text-sm tabular-nums">{formatValue(row.wagered)}</span>
              <span className="text-right">
                <ValueGem amount={row.prize} className="justify-end" />
              </span>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-center text-xs text-muted-foreground">
        Standings and the prize pool are mock demonstration data. No race rewards are paid.
      </p>
    </div>
  );
}
