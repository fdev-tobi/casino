"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/lobby/avatar";
import { CoinFlipCoin, COIN_FLIP_DURATION_MS } from "@/components/lobby/coinflip-coin";
import { CoinSideIcon } from "@/components/lobby/coin-side-icon";
import { useDisplayValues } from "@/components/lobby/display-values-provider";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import type { CoinFlipGame, CoinSide, DemoItem, DemoPlayer } from "@/types/lobby";

function PlayerColumn({
  player,
  side,
  waiting,
  outcome = "pending",
}: {
  player: DemoPlayer | null;
  side: CoinSide;
  waiting?: boolean;
  /** After the flip settles: light up the winner, dim the loser. */
  outcome?: "pending" | "winner" | "loser";
}) {
  const isWinner = outcome === "winner";
  const isLoser = outcome === "loser";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-2 transition duration-500",
        isLoser && "opacity-40",
      )}
    >
      {player && !waiting ? (
        <span className={cn("relative", isWinner && "cf-winner-aura")}>
          <Avatar
            player={player}
            size="lg"
            className={cn(
              "size-16 border-2 sm:size-[4.5rem]",
              isWinner
                ? "border-primary shadow-[0_0_0_3px_rgba(84,104,241,0.55)]"
                : "border-white/15",
            )}
          />
          <span className="absolute -bottom-1 -left-1 inline-flex size-8 items-center justify-center overflow-hidden rounded-full bg-black shadow-md ring-2 ring-[#121218] sm:size-9">
            <CoinSideIcon side={side} className="size-full" />
          </span>
        </span>
      ) : (
        <span className="relative inline-flex size-16 items-center justify-center sm:size-[4.5rem]">
          <span className="absolute inset-0 rounded-full border-2 border-dashed border-white/20" />
          <CoinSideIcon side={side} className="size-[85%] opacity-40" />
        </span>
      )}
      <p
        className={cn(
          "max-w-[7.5rem] truncate text-sm font-semibold sm:max-w-[9rem]",
          isWinner ? "text-primary" : "text-white/90",
        )}
      >
        {waiting || !player ? "Waiting…" : player.name}
      </p>
    </div>
  );
}

function ChanceCard({
  percent,
  amount,
  muted = false,
}: {
  percent: string;
  amount: number;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl bg-[#1c1e27] px-3 py-3 sm:px-4",
        muted && "opacity-45",
      )}
    >
      <span className={cn("text-base font-semibold tabular-nums", muted ? "text-white/40" : "text-white/55")}>
        {percent}
      </span>
      <ValueGem amount={amount} className="text-sm sm:text-base" muted={muted} />
    </div>
  );
}

function ItemsCard({ items, muted = false }: { items: readonly DemoItem[]; muted?: boolean }) {
  const lead = items[0];
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className={cn(
        "flex min-h-[5.5rem] items-center gap-3 rounded-xl bg-[#1c1e27] px-3 py-3 sm:min-h-[6.25rem] sm:px-4",
        muted && "opacity-45",
      )}
    >
      {lead ? (
        <>
          <ItemChip item={lead} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{lead.name}</p>
            {items.length > 1 ? (
              <p className="mt-0.5 text-xs text-white/40">+{items.length - 1} more</p>
            ) : null}
          </div>
          <ValueGem amount={total} className="shrink-0 text-sm" muted={muted} />
        </>
      ) : (
        <p className="w-full text-center text-sm text-white/35">Waiting for items…</p>
      )}
    </div>
  );
}

export function CoinFlipMatchView({
  game,
  onJoin,
  onCancel,
  canJoin = true,
  canCancel = false,
  onFlipSettled,
}: {
  game: CoinFlipGame;
  onJoin: () => void;
  onCancel?: () => void;
  canJoin?: boolean;
  /** Host can cancel an open match with no joiner. */
  canCancel?: boolean;
  /** Fires once after the join-started flip animation finishes. */
  onFlipSettled?: (game: CoinFlipGame) => void;
}) {
  const { sumAmounts } = useDisplayValues();
  const hostTotal = sumAmounts([...game.items]);
  const joinerItems = game.joinerItems ?? [];
  const joinerTotal = sumAmounts([...joinerItems]);
  const hasJoiner = Boolean(game.joiner);
  const hostPercent = hasJoiner ? "50.00%" : "100.00%";
  const joinerPercent = hasJoiner ? "50.00%" : "0%";
  const spinning = Boolean(game.flipStartedAt) && (game.status === "full" || game.status === "ended");
  const hostSide = game.hostSide ?? "heads";
  const leftPlayer = hostSide === "heads" ? game.host : game.joiner;
  const rightPlayer = hostSide === "heads" ? game.joiner : game.host;
  const leftWaiting = hostSide === "heads" ? false : !hasJoiner;
  const rightWaiting = hostSide === "heads" ? !hasJoiner : false;
  const leftItems = hostSide === "heads" ? game.items : joinerItems;
  const rightItems = hostSide === "heads" ? joinerItems : game.items;
  const leftAmount = hostSide === "heads" ? hostTotal : joinerTotal;
  const rightAmount = hostSide === "heads" ? joinerTotal : hostTotal;

  const [settledNotified, setSettledNotified] = useState(false);
  const [flipDone, setFlipDone] = useState(false);

  const leftOutcome: "pending" | "winner" | "loser" =
    !flipDone || !game.winnerSide
      ? "pending"
      : game.winnerSide === "heads"
        ? "winner"
        : "loser";
  const rightOutcome: "pending" | "winner" | "loser" =
    !flipDone || !game.winnerSide
      ? "pending"
      : game.winnerSide === "tails"
        ? "winner"
        : "loser";

  useEffect(() => {
    setSettledNotified(false);
    setFlipDone(false);
  }, [game.id, game.flipStartedAt]);

  useEffect(() => {
    if (!game.flipStartedAt) {
      setFlipDone(false);
      return;
    }
    if (game.status === "ended") {
      setFlipDone(true);
      return;
    }
    const age = Date.now() - game.flipStartedAt;
    if (age >= COIN_FLIP_DURATION_MS) {
      setFlipDone(true);
      return;
    }
    const timer = window.setTimeout(() => setFlipDone(true), COIN_FLIP_DURATION_MS - age + 20);
    return () => window.clearTimeout(timer);
  }, [game.flipStartedAt, game.status]);

  useEffect(() => {
    if (!flipDone || settledNotified || !onFlipSettled || !game.flipStartedAt) return;
    if (game.status === "ended") {
      setSettledNotified(true);
      return;
    }
    // Ignore absurdly old start times (stale data) — only settle live joins.
    if (Date.now() - game.flipStartedAt > 60_000) {
      setSettledNotified(true);
      return;
    }
    onFlipSettled(game);
    setSettledNotified(true);
  }, [flipDone, settledNotified, onFlipSettled, game]);

  return (
    <div className="flex min-h-full flex-col">
      <DialogTitle className="sr-only">CoinFlip match</DialogTitle>
      <DialogDescription className="sr-only">
        Match between {game.host.name}
        {game.joiner ? ` and ${game.joiner.name}` : ""}.
      </DialogDescription>

      <div className="flex items-center justify-center pt-1 pb-2">
        <div className="flex items-center gap-2">
          <Image
            src={brand.mark.src}
            alt=""
            width={28}
            height={28}
            unoptimized
            className="size-7"
          />
          <span className="text-sm font-bold tracking-wide uppercase text-white/90">{brand.name}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-1 sm:mt-8 sm:gap-3 sm:px-2">
        <PlayerColumn
          player={leftPlayer}
          side="heads"
          waiting={leftWaiting}
          outcome={leftOutcome}
        />
        {hasJoiner && game.flipStartedAt ? (
          <div className="relative z-20 flex shrink-0 items-center justify-center overflow-visible">
            <CoinFlipCoin
              key={`${game.flipStartedAt}-${game.winnerSide ?? "heads"}`}
              size="lg"
              spinning={spinning}
              flipStartedAt={game.flipStartedAt}
              resultSide={game.winnerSide ?? "heads"}
            />
          </div>
        ) : (
          <span className="px-2 text-sm font-bold tracking-wide text-white/35">VS</span>
        )}
        <PlayerColumn
          player={rightPlayer}
          side="tails"
          waiting={rightWaiting}
          outcome={rightOutcome}
        />
      </div>

      <button
        type="button"
        className="mx-auto mt-1 max-w-full truncate px-3 font-mono text-xs text-white/40 transition hover:text-white/65"
        title="Copy server seed hash"
        onClick={async () => {
          await navigator.clipboard?.writeText(game.hash);
        }}
      >
        # {game.hash}
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5">
        <ChanceCard percent={hostPercent} amount={leftAmount} muted={leftWaiting} />
        <ChanceCard percent={joinerPercent} amount={rightAmount} muted={!hasJoiner} />
        <ItemsCard items={leftItems} muted={leftWaiting} />
        <ItemsCard items={rightItems} muted={!hasJoiner} />
      </div>

      {game.status === "open" && canJoin ? (
        <Button type="button" className="mt-4 h-11 w-full rounded-full text-base font-bold" onClick={onJoin}>
          Join match
        </Button>
      ) : game.status === "open" && canCancel && onCancel ? (
        <div className="mt-4 grid gap-2">
          <p className="text-center text-sm font-semibold text-white/45">You created this match</p>
          <Button
            type="button"
            variant="secondary"
            className="h-11 w-full rounded-full text-base font-bold"
            onClick={onCancel}
          >
            Cancel match
          </Button>
        </div>
      ) : game.status === "open" && !canJoin ? (
        <p className="mt-4 text-center text-sm font-semibold text-white/45">You created this match</p>
      ) : game.winnerSide && flipDone ? (
        <p className="mt-4 text-center text-sm font-bold text-primary">
          {game.winnerSide === "heads" ? "Heads" : "Tails"} wins
        </p>
      ) : (
        <div className="mt-4 sm:mt-2" />
      )}
    </div>
  );
}
