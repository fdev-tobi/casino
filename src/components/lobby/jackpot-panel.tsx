"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/components/lobby/avatar";
import { DemoNotice } from "@/components/lobby/demo-notice";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import { jackpotRound } from "@/lib/mock-data";

export function JackpotPanel() {
  const [seconds, setSeconds] = useState(jackpotRound.secondsLeft);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const progress = Math.max(0, Math.min(1, seconds / jackpotRound.duration));

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((current) => (current <= 0 ? jackpotRound.duration : current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

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
            <ValueGem amount={jackpotRound.pot} className="justify-center text-2xl" />
            <p className="mt-2 text-sm text-muted-foreground">
              {jackpotRound.entries.length} | {seconds}s
            </p>
          </div>
        </div>
        <Button type="button" className="mt-6 w-full" onClick={() => setNoticeOpen(true)}>
          JOIN
        </Button>
      </section>

      <section className="rounded border bg-card p-4">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-white/50">Entries</h2>
        <ul className="mt-3 grid gap-2">
          {jackpotRound.entries.map((entry) => (
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

      <DemoNotice
        open={noticeOpen}
        onOpenChange={setNoticeOpen}
        title="Join jackpot is demo only"
        description="The wheel and timer are presentation controls. No pot is funded and no winner is paid."
      />
    </div>
    </div>
  );
}
