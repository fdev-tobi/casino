"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { Avatar } from "@/components/lobby/avatar";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import { jackpotRound } from "@/lib/mock-data";
import type { DemoPlayer } from "@/types/lobby";

export function JackpotPanel() {
  const { user, openLogin } = useAuth();
  const [seconds, setSeconds] = useState(jackpotRound.secondsLeft);
  const [joined, setJoined] = useState(false);
  const [entries, setEntries] = useState(() => [...jackpotRound.entries]);
  const progress = Math.max(0, Math.min(1, seconds / jackpotRound.duration));
  const pot = entries.reduce((sum, entry) => sum + entry.value, 0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((current) => (current <= 0 ? jackpotRound.duration : current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  function join() {
    if (!user) {
      openLogin();
      return;
    }
    if (joined) return;
    const player: DemoPlayer = {
      id: `jp-${user.username}`,
      name: user.username,
      initials: user.username.slice(0, 2).toUpperCase(),
      color: "#5468f1",
    };
    const value = 150;
    setEntries((current) => {
      const next = [
        ...current,
        {
          id: `je-local-${Date.now()}`,
          player,
          items: [{ id: `ji-${Date.now()}`, name: "Ash Key", value, tone: "slate" as const }],
          value,
          chance: 0,
        },
      ];
      const total = next.reduce((sum, entry) => sum + entry.value, 0);
      return next.map((entry) => ({ ...entry, chance: (entry.value / total) * 100 }));
    });
    setJoined(true);
  }

  return (
    <div className="flex w-full flex-col px-4 pt-3 pb-32">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded border bg-card p-4">
          <div className="mb-4 inline-flex items-center rounded-sm bg-primary px-5 py-1.5 text-sm font-semibold text-background">
            MM2
          </div>
          <div className="relative mx-auto flex size-56 items-center justify-center sm:size-64">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(var(--primary) ${progress * 360}deg, #22242f 0deg)`,
              }}
            />
            <div className="absolute inset-3 rounded-full bg-background" />
            <div className="relative z-10 grid text-center">
              <ValueGem amount={pot} className="justify-center text-2xl" />
              <p className="mt-2 text-sm text-muted-foreground">
                {entries.length} | {seconds}s
              </p>
            </div>
          </div>
          <Button type="button" className="mt-6 w-full" onClick={join} disabled={joined}>
            {joined ? "JOINED" : "JOIN"}
          </Button>
        </section>

        <section className="rounded border bg-card p-4">
          <h2 className="text-xs font-semibold tracking-wide uppercase text-white/50">Entries</h2>
          <ul className="mt-3 grid gap-2">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 rounded border bg-card px-4 py-2">
                <Avatar player={entry.player} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{entry.player.name}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {entry.items.map((item) => (
                      <ItemChip key={item.id} item={item} size="sm" />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <ValueGem amount={entry.value} />
                  <p className="text-xs text-primary">{entry.chance.toFixed(1)}%</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
