"use client";

import { useMemo, useState } from "react";

import { Avatar } from "@/components/lobby/avatar";
import { DemoNotice } from "@/components/lobby/demo-notice";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatRange } from "@/lib/format";
import { coinFlipGames, historyEntries, lobbyStats } from "@/lib/mock-data";
import type { CoinFlipGame } from "@/types/lobby";

export function CoinFlipLobby() {
  const [selected, setSelected] = useState<CoinFlipGame | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState<{ title: string; description: string } | null>(null);
  const openGames = useMemo(() => coinFlipGames.filter((game) => game.status !== "ended"), []);

  return (
    <div className="flex w-full flex-col px-4 pt-3 pb-32">
      <div className="grid gap-2 md:grid-cols-3">
        <div className="rounded border bg-card px-4 py-2">
          <div className="text-xl font-semibold">{lobbyStats.totalItems}</div>
          <div className="font-semibold opacity-60">Total Items</div>
        </div>
        <div className="rounded border bg-card px-4 py-2">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <ValueGem amount={lobbyStats.totalValue} />
          </div>
          <div className="font-semibold opacity-60">Total Value</div>
        </div>
        <div className="rounded border bg-card px-4 py-2">
          <div className="text-xl font-semibold">{lobbyStats.activeGames}</div>
          <div className="font-semibold opacity-60">Active Games</div>
        </div>
      </div>

      <div className="mt-4 mb-3 flex flex-col justify-between gap-2 sm:flex-row-reverse">
        <div className="flex items-center justify-start gap-2">
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create
          </Button>
          <Button type="button" variant="secondary" onClick={() => setHistoryOpen(true)}>
            History
          </Button>
        </div>
        <div>
          <span className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-1.5 text-sm font-semibold text-background data-[state=active]:shadow-sm">
            MM2
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2" aria-label="Active coinflip games">
        {openGames.map((game) => (
          <div
            key={game.id}
            className="flex flex-col items-center justify-between gap-4 rounded border bg-card px-4 py-4 md:flex-row md:py-2"
          >
            <div className="flex items-center gap-4">
              <Avatar player={game.host} size="lg" className="size-14 border-2" />
              <span className="mt-2 text-sm font-semibold opacity-50 md:hidden">VS</span>
              {game.joiner ? (
                <Avatar player={game.joiner} size="lg" className="size-14 border-2" />
              ) : (
                <span className="inline-flex size-[65px] items-center justify-center rounded-full border-2 border-dashed border-white/20 text-xs text-white/40">
                  ?
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 items-center gap-2 lg:grid-cols-2">
              <div className="flex w-52 items-center justify-center -space-x-4 overflow-hidden md:justify-start">
                {game.items.slice(0, 4).map((item) => (
                  <ItemChip key={item.id} item={item} size="lg" />
                ))}
                {game.items.length > 4 ? (
                  <span className="pl-4 text-xs text-white/50">+{game.items.length - 4}</span>
                ) : null}
              </div>
              <div className="hidden lg:block" />
            </div>

            <div className="flex w-36 flex-col text-center">
              <ValueGem amount={game.value} className="justify-center text-base font-semibold" />
              <div className="text-sm opacity-50">{formatRange(game.rangeMin, game.rangeMax)}</div>
            </div>

            <div className="flex flex-col gap-2">
              {game.status === "open" ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setNotice({
                      title: "Join is demo only",
                      description: `Would join ${game.host.name}'s match for ${game.value} demo units.`,
                    })
                  }
                >
                  Join
                </Button>
              ) : null}
              <Button type="button" size="sm" variant="secondary" onClick={() => setSelected(game)}>
                View
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>CoinFlip match</DialogTitle>
                <DialogDescription>Demonstration match details. No wager is placed.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 text-center">
                <div className="grid justify-items-center gap-2">
                  <Avatar player={selected.host} size="lg" />
                  <p className="truncate text-sm font-semibold">{selected.host.name}</p>
                </div>
                <p className="text-xl font-semibold text-white/50">Vs</p>
                <div className="grid justify-items-center gap-2">
                  {selected.joiner ? (
                    <>
                      <Avatar player={selected.joiner} size="lg" />
                      <p className="truncate text-sm font-semibold">{selected.joiner.name}</p>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex size-14 items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground">
                        ?
                      </span>
                      <p className="text-sm text-muted-foreground">Joining...</p>
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="w-full truncate rounded border bg-card px-3 py-2 font-mono text-xs text-white/50"
                onClick={async () => {
                  await navigator.clipboard?.writeText(selected.hash);
                }}
              >
                #{selected.hash}
              </button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded border bg-card p-3 text-center">
                  <p className="text-lg font-semibold text-primary">
                    {selected.joiner ? "50.00%" : "100.00%"}
                  </p>
                  <ValueGem amount={selected.value} className="mt-1 justify-center" />
                </div>
                <div className="rounded border bg-card p-3 text-center">
                  <p className="text-lg font-semibold text-white/50">
                    {selected.joiner ? "50.00%" : "0%"}
                  </p>
                  <ValueGem amount={selected.joiner ? selected.value : 0} muted className="mt-1 justify-center" />
                </div>
              </div>
              <ul className="mt-3 grid gap-2">
                {selected.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 rounded border bg-card px-4 py-2">
                    <ItemChip item={item} />
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    <ValueGem amount={item.value} />
                  </li>
                ))}
              </ul>
              {selected.status === "open" ? (
                <Button
                  type="button"
                  className="mt-2 w-full"
                  onClick={() => {
                    setSelected(null);
                    setNotice({
                      title: "Join is demo only",
                      description: "No items move and no balance changes in this prototype.",
                    });
                  }}
                >
                  Join
                </Button>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create coinflip</DialogTitle>
            <DialogDescription>Choose mock items to list a demonstration match.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Creating a match here only previews the flow. It does not list a real game or lock inventory.
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setCreateOpen(false);
              setNotice({
                title: "Create is demo only",
                description: "No match was published to a live lobby.",
              });
            }}
          >
            Create demo match
          </Button>
        </DialogContent>
      </Dialog>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>History</SheetTitle>
            <SheetDescription>Mock recent activity for this presentation.</SheetDescription>
          </SheetHeader>
          <ul className="mt-4 grid gap-2">
            {historyEntries.map((entry) => (
              <li key={entry.id} className="rounded border bg-card px-4 py-2">
                <div className="flex items-center justify-between gap-2 text-xs text-white/50">
                  <span className="font-semibold uppercase text-primary">{entry.mode}</span>
                  <span>{entry.at}</span>
                </div>
                <p className="mt-1 text-sm">{entry.summary}</p>
                <ValueGem amount={entry.value} className="mt-2" />
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <DemoNotice
        open={notice !== null}
        onOpenChange={(open) => !open && setNotice(null)}
        title={notice?.title ?? "Demo only"}
        description={notice?.description ?? ""}
      />
    </div>
  );
}
