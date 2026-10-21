"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { Avatar } from "@/components/lobby/avatar";
import { useDisplayValues } from "@/components/lobby/display-values-provider";
import { useInventory } from "@/components/lobby/inventory-provider";
import { ItemChip } from "@/components/lobby/item-chip";
import { SelectInventoryDialog } from "@/components/lobby/select-inventory-dialog";
import { ValueGem } from "@/components/lobby/value-gem";
import { useWallet } from "@/components/lobby/wallet-provider";
import { Button } from "@/components/ui/button";
import { jackpotRound } from "@/lib/mock-data";
import type { DemoItem, DemoPlayer, JackpotEntry } from "@/types/lobby";

function withChances(entries: JackpotEntry[], sumAmounts: (items: DemoItem[]) => number): JackpotEntry[] {
  const total = entries.reduce((sum, entry) => sum + sumAmounts([...entry.items]), 0);
  if (total <= 0) {
    return entries.map((entry) => ({ ...entry, chance: 0, value: 0 }));
  }
  return entries.map((entry) => {
    const value = sumAmounts([...entry.items]);
    return {
      ...entry,
      value,
      chance: (value / total) * 100,
    };
  });
}

export function JackpotPanel() {
  const { user, openLogin } = useAuth();
  const { sumAmounts } = useDisplayValues();
  const { removeByIds, depositMany } = useInventory();
  const { openWallet } = useWallet();
  const [seconds, setSeconds] = useState(jackpotRound.secondsLeft);
  const [joined, setJoined] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [myEntryId, setMyEntryId] = useState<string | null>(null);
  const [myItems, setMyItems] = useState<DemoItem[]>([]);
  const [entries, setEntries] = useState(() => [...jackpotRound.entries]);
  const progress = Math.max(0, Math.min(1, seconds / jackpotRound.duration));
  const pot = entries.reduce((sum, entry) => sum + sumAmounts([...entry.items]), 0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((current) => (current <= 0 ? jackpotRound.duration : current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  function requestJoin() {
    if (!user) {
      openLogin();
      return;
    }
    if (joined) return;
    setSelectOpen(true);
  }

  function confirmJoin(items: DemoItem[]) {
    if (!user || joined || items.length === 0) return;

    const player: DemoPlayer = {
      id: `jp-${user.username}`,
      name: user.username,
      initials: user.username.slice(0, 2).toUpperCase(),
      color: "#5468f1",
      robloxUserId: user.userId,
      avatarUrl: user.avatarUrl,
    };

    const entryId = `je-local-${Date.now()}`;
    const staked = items.map((item) => ({ ...item }));

    removeByIds(items.map((item) => item.id));
    setEntries((current) =>
      withChances(
        [
          ...current,
          {
            id: entryId,
            player,
            items: staked,
            value: 0,
            chance: 0,
          },
        ],
        sumAmounts,
      ),
    );
    setMyEntryId(entryId);
    setMyItems(staked);
    setJoined(true);
    setSelectOpen(false);
  }

  function cancelJoin() {
    if (!joined || !myEntryId) return;
    const refund = myItems;
    setEntries((current) =>
      withChances(
        current.filter((entry) => entry.id !== myEntryId),
        sumAmounts,
      ),
    );
    if (refund.length > 0) {
      depositMany(refund);
    }
    setMyEntryId(null);
    setMyItems([]);
    setJoined(false);
  }

  return (
    <div className="flex w-full flex-col px-4 pt-3 pb-32">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded border bg-card p-4">
          <div className="mb-4 inline-flex items-center rounded-sm bg-primary px-5 py-1.5 text-sm font-semibold text-background">
            Jackpot
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
          {joined ? (
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button type="button" className="w-full" disabled>
                JOINED
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={cancelJoin}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button type="button" className="mt-6 w-full" onClick={requestJoin}>
              JOIN
            </Button>
          )}
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
                  <ValueGem amount={sumAmounts([...entry.items])} />
                  <p className="text-xs text-primary">{entry.chance.toFixed(1)}%</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <SelectInventoryDialog
        open={selectOpen}
        onOpenChange={setSelectOpen}
        title="Join Jackpot"
        description="Select pets from your inventory to add to this round."
        confirmLabel="Join With"
        onConfirm={confirmJoin}
        onDepositClick={() => {
          setSelectOpen(false);
          openWallet();
        }}
      />
    </div>
  );
}
