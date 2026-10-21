"use client";

import { useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { CoinFlipGameRow } from "@/components/lobby/coinflip-game-row";
import { CoinFlipMatchView } from "@/components/lobby/coinflip-match-view";
import { CreateCoinflipDialog } from "@/components/lobby/create-coinflip-dialog";
import { useInventory } from "@/components/lobby/inventory-provider";
import { SelectInventoryDialog } from "@/components/lobby/select-inventory-dialog";
import { ValueGem } from "@/components/lobby/value-gem";
import { useWallet } from "@/components/lobby/wallet-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { coinFlipGames, lobbyStats } from "@/lib/mock-data";
import type { CoinFlipGame, CoinSide, DemoItem, DemoPlayer } from "@/types/lobby";

function userAsPlayer(
  username: string,
  userId?: number,
  avatarUrl?: string | null,
): DemoPlayer {
  return {
    id: `user-${username}`,
    name: username,
    initials: username.slice(0, 2).toUpperCase(),
    color: "#5468f1",
    robloxUserId: userId,
    avatarUrl,
  };
}

function isUserInGame(game: CoinFlipGame, username: string): boolean {
  const key = username.toLowerCase();
  return game.host.name.toLowerCase() === key || game.joiner?.name.toLowerCase() === key;
}

export function CoinFlipLobby() {
  const { user, openLogin } = useAuth();
  const { removeByIds, depositMany } = useInventory();
  const { openWallet } = useWallet();
  const [games, setGames] = useState(() =>
    coinFlipGames.map((game) => ({
      ...game,
      joinerItems: game.joinerItems ?? [],
    })),
  );
  const [selected, setSelected] = useState<CoinFlipGame | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinTarget, setJoinTarget] = useState<CoinFlipGame | null>(null);
  const [joinedToast, setJoinedToast] = useState<string | null>(null);
  const creditedFlips = useRef(new Set<string>());

  function openMatch(game: CoinFlipGame) {
    // Do not remount/restart the flip — sync to game.flipStartedAt.
    setSelected(game);
  }

  const openGames = useMemo(() => games.filter((game) => game.status !== "ended"), [games]);

  const myHistory = useMemo(() => {
    if (!user) return [];
    return games
      .filter((game) => isUserInGame(game, user.username))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [games, user]);

  function requireUser() {
    if (!user) {
      openLogin();
      return null;
    }
    return user;
  }

  function requestJoin(game: CoinFlipGame) {
    const current = requireUser();
    if (!current) return;
    if (game.host.name.toLowerCase() === current.username.toLowerCase()) {
      setJoinedToast("You can't join your own match");
      window.setTimeout(() => setJoinedToast(null), 2000);
      return;
    }
    if (game.status !== "open" || game.joiner) {
      setJoinedToast("This match is no longer open");
      window.setTimeout(() => setJoinedToast(null), 2000);
      return;
    }
    setJoinTarget(game);
  }

  function confirmJoin(items: DemoItem[]) {
    const current = requireUser();
    const game = joinTarget;
    if (!current || !game || items.length === 0) return;

    const joiner = userAsPlayer(current.username, current.userId, current.avatarUrl);
    const flipStartedAt = Date.now();
    const winnerSide: CoinSide = Math.random() < 0.5 ? "heads" : "tails";

    const updated: CoinFlipGame = {
      ...game,
      joiner,
      joinerItems: items.map((item) => ({ ...item })),
      status: "full",
      flipStartedAt,
      winnerSide,
    };

    removeByIds(items.map((item) => item.id));
    setGames((list) => list.map((entry) => (entry.id === game.id ? updated : entry)));
    setJoinTarget(null);
    setSelected(updated);
    setJoinedToast(`Joined ${game.host.name}'s match — flipping!`);
    window.setTimeout(() => setJoinedToast(null), 2000);
  }

  function createMatch(payload: { items: DemoItem[]; side: CoinSide }) {
    const current = requireUser();
    if (!current || payload.items.length === 0) return;
    const host = userAsPlayer(current.username, current.userId, current.avatarUrl);
    const value = payload.items.reduce((sum, item) => sum + item.value, 0);
    const created: CoinFlipGame = {
      id: `cf-local-${Date.now()}`,
      hash: Math.random().toString(16).slice(2).padEnd(32, "0").slice(0, 32),
      catalog: "adoptme",
      status: "open",
      host,
      joiner: null,
      hostSide: payload.side,
      items: payload.items.map((item) => ({ ...item })),
      joinerItems: [],
      value,
      rangeMin: Math.round(value * 0.95),
      rangeMax: Math.round(value * 1.05),
      createdAt: new Date().toISOString(),
      flipStartedAt: null,
      winnerSide: null,
    };
    removeByIds(payload.items.map((item) => item.id));
    setGames((list) => [created, ...list]);
    setCreateOpen(false);
    setJoinedToast("Match created");
    window.setTimeout(() => setJoinedToast(null), 2000);
  }

  function handleFlipSettled(game: CoinFlipGame) {
    if (!game.winnerSide || creditedFlips.current.has(game.id)) return;
    creditedFlips.current.add(game.id);

    setGames((list) =>
      list.map((entry) => (entry.id === game.id ? { ...entry, status: "ended" as const } : entry)),
    );
    setSelected((current) =>
      current?.id === game.id ? { ...current, status: "ended" } : current,
    );

    if (!user) return;

    const hostWon = game.winnerSide === game.hostSide;
    const winner = hostWon ? game.host : game.joiner;
    if (!winner || winner.name.toLowerCase() !== user.username.toLowerCase()) return;

    const pot = [...game.items, ...(game.joinerItems ?? [])];
    if (pot.length === 0) return;
    depositMany(pot);
    setJoinedToast(`You won ${pot.length} pet${pot.length === 1 ? "" : "s"}!`);
    window.setTimeout(() => setJoinedToast(null), 2500);
  }

  return (
    <div className="flex w-full min-w-0 flex-col px-3 pt-3 pb-32 sm:px-4">
      {joinedToast ? (
        <div className="mb-3 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          {joinedToast}
        </div>
      ) : null}

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
          <div className="text-xl font-semibold">{openGames.length}</div>
          <div className="font-semibold opacity-60">Active Games</div>
        </div>
      </div>

      <div className="mt-4 mb-3 flex flex-col justify-between gap-2 sm:flex-row-reverse">
        <div className="flex items-center justify-start gap-2">
          <Button type="button" onClick={() => (user ? setCreateOpen(true) : openLogin())}>
            Create
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => (user ? setHistoryOpen(true) : openLogin())}
          >
            History
          </Button>
        </div>
        <div>
          <span className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-1.5 text-sm font-semibold text-background">
            Adopt Me
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2" aria-label="Active coinflip games">
        {openGames.map((game) => {
          const isOwn =
            !!user && game.host.name.toLowerCase() === user.username.toLowerCase();
          return (
            <CoinFlipGameRow
              key={game.id}
              game={game}
              showJoin={!isOwn && game.status === "open"}
              onJoin={() => requestJoin(game)}
              onView={() => openMatch(game)}
            />
          );
        })}
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent fullscreen className="border-[#22242f] bg-[#121218] sm:max-w-lg">
          {selected ? (
            <CoinFlipMatchView
              game={selected}
              canJoin={
                !user || selected.host.name.toLowerCase() !== user.username.toLowerCase()
              }
              onJoin={() => requestJoin(selected)}
              onFlipSettled={handleFlipSettled}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <CreateCoinflipDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={createMatch}
      />

      <SelectInventoryDialog
        open={joinTarget !== null}
        onOpenChange={(open) => !open && setJoinTarget(null)}
        title="Join Coinflip"
        description={
          joinTarget
            ? `Select pets to match ${joinTarget.host.name}'s wager.`
            : undefined
        }
        confirmLabel="Join With"
        targetValue={joinTarget?.value}
        rangeMin={joinTarget?.rangeMin}
        rangeMax={joinTarget?.rangeMax}
        onConfirm={confirmJoin}
        onDepositClick={() => {
          setJoinTarget(null);
          openWallet();
        }}
      />

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent className="w-full max-w-full sm:w-[min(100%,36rem)] sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>History</SheetTitle>
            <SheetDescription>Coinflip matches you created or joined.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2 overflow-y-auto pb-6" aria-label="Your coinflip history">
            {myHistory.length === 0 ? (
              <div className="rounded border border-dashed border-white/15 px-4 py-10 text-center">
                <p className="text-base font-semibold">No matches yet</p>
                <p className="mt-1 text-sm text-white/50">
                  Create or join a coinflip and it will show up here.
                </p>
              </div>
            ) : (
              myHistory.map((game) => (
                <CoinFlipGameRow
                  key={game.id}
                  game={game}
                  showJoin={false}
                  onView={() => {
                    setHistoryOpen(false);
                    openMatch(game);
                  }}
                />
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
