"use client";

import Image from "next/image";

import { Avatar } from "@/components/lobby/avatar";
import { CoinFlipCoin } from "@/components/lobby/coinflip-coin";
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
}: {
  player: DemoPlayer | null;
  side: CoinSide;
  waiting?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      {player && !waiting ? (
        <span className="relative">
          <Avatar player={player} size="lg" className="size-16 border-2 border-white/15 sm:size-[4.5rem]" />
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
      <p className="max-w-[7.5rem] truncate text-sm font-semibold text-white/90 sm:max-w-[9rem]">
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
          <ValueGem amount={lead.value} itemId={lead.id} className="shrink-0 text-sm" muted={muted} />
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
  canJoin = true,
}: {
  game: CoinFlipGame;
  onJoin: () => void;
  /** False when the viewer hosts this match (cannot join own game). */
  canJoin?: boolean;
}) {
  const { sumAmounts } = useDisplayValues();
  const total = sumAmounts([...game.items]);
  const hasJoiner = Boolean(game.joiner);
  const hostPercent = hasJoiner ? "50.00%" : "100.00%";
  const joinerPercent = hasJoiner ? "50.00%" : "0%";
  const spinning = game.status === "full" || game.status === "ended";
  const hostSide = game.hostSide ?? "heads";
  const leftPlayer = hostSide === "heads" ? game.host : game.joiner;
  const rightPlayer = hostSide === "heads" ? game.joiner : game.host;
  const leftWaiting = hostSide === "heads" ? false : !hasJoiner;
  const rightWaiting = hostSide === "heads" ? !hasJoiner : false;

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

      <div className="relative mt-3 flex flex-1 items-center justify-between gap-2 px-1 py-10 sm:px-3 sm:py-12">
        <PlayerColumn player={leftPlayer} side="heads" waiting={leftWaiting} />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
          <CoinFlipCoin spinning={spinning} />
        </div>
        <PlayerColumn player={rightPlayer} side="tails" waiting={rightWaiting} />
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
        <ChanceCard percent={hostPercent} amount={total} />
        <ChanceCard percent={joinerPercent} amount={hasJoiner ? total : 0} muted={!hasJoiner} />
        <ItemsCard items={game.items} />
        <ItemsCard items={hasJoiner ? game.items : []} muted={!hasJoiner} />
      </div>

      {game.status === "open" && canJoin ? (
        <Button type="button" className="mt-4 h-11 w-full rounded-full text-base font-bold" onClick={onJoin}>
          Join match
        </Button>
      ) : game.status === "open" && !canJoin ? (
        <p className="mt-4 text-center text-sm font-semibold text-white/45">You created this match</p>
      ) : (
        <div className="mt-4 sm:mt-2" />
      )}
    </div>
  );
}
