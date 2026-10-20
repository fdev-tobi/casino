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
    <div className="grid gap-4">
      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ["Total Items", lobbyStats.totalItems],
          ["Total Value", lobbyStats.totalValue],
          ["Active Games", lobbyStats.activeGames],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-lg border border-border bg-card px-3 py-3 text-center">
            <p className="font-mono text-xl font-bold text-primary sm:text-3xl">
              {typeof value === "number" ? value.toLocaleString("en-US") : value}
            </p>
            <p className="mt-1 text-[0.7rem] text-muted-foreground sm:text-sm">{label}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-bold tracking-[0.14em] uppercase text-primary">
          MM2
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create
          </Button>
          <Button type="button" variant="secondary" onClick={() => setHistoryOpen(true)}>
            History
          </Button>
        </div>
      </section>

      <section className="grid gap-2" aria-label="Active coinflip games">
        {openGames.map((game) => (
          <article
            key={game.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:grid-cols-[auto_auto_1fr_auto_auto]"
          >
            <Avatar player={game.host} />
            <div className="hidden items-center gap-1.5 sm:flex">
              {game.items.slice(0, 3).map((item) => (
                <ItemChip key={item.id} item={item} size="sm" />
              ))}
              {game.items.length > 3 ? (
                <span className="text-xs text-muted-foreground">+{game.items.length - 3}</span>
              ) : null}
            </div>
            <div className="min-w-0">
              <ValueGem amount={game.value} />
              <p className="mt-0.5 text-xs text-muted-foreground">{formatRange(game.rangeMin, game.rangeMax)}</p>
            </div>
            <div className="col-span-1 flex flex-col gap-1.5 sm:col-auto">
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
          </article>
        ))}
      </section>

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
                <p className="text-2xl font-black text-muted-foreground">Vs</p>
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
                className="w-full truncate rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground"
                onClick={async () => {
                  await navigator.clipboard?.writeText(selected.hash);
                }}
              >
                #{selected.hash}
              </button>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-card p-3 text-center">
                  <p className="text-lg font-bold text-primary">
                    {selected.joiner ? "50.00%" : "100.00%"}
                  </p>
                  <ValueGem amount={selected.value} className="mt-1 justify-center" />
                </div>
                <div className="rounded-md border border-border bg-card p-3 text-center">
                  <p className="text-lg font-bold text-muted-foreground">
                    {selected.joiner ? "50.00%" : "0%"}
                  </p>
                  <ValueGem amount={selected.joiner ? selected.value : 0} muted className="mt-1 justify-center" />
                </div>
              </div>
              <ul className="mt-3 grid gap-2">
                {selected.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
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
              <li key={entry.id} className="rounded-md border border-border bg-card px-3 py-3">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-[0.12em] text-primary">{entry.mode}</span>
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
