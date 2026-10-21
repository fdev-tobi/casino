"use client";

import { Avatar } from "@/components/lobby/avatar";
import { useDisplayValues } from "@/components/lobby/display-values-provider";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import { formatRange } from "@/lib/format";
import type { CoinFlipGame } from "@/types/lobby";

export function CoinFlipGameRow({
  game,
  onJoin,
  onView,
  onCancel,
  showJoin = true,
}: {
  game: CoinFlipGame;
  onJoin?: () => void;
  onView: () => void;
  onCancel?: () => void;
  showJoin?: boolean;
}) {
  const { sumAmounts } = useDisplayValues();
  const total = sumAmounts([...game.items]);

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded border bg-card px-4 py-4 md:flex-row md:py-2">
      <div className="flex items-center gap-4">
        <Avatar player={game.host} size="lg" className="size-14 border-2" />
        <span className="mt-2 text-sm font-semibold opacity-50 md:hidden">VS</span>
        {game.joiner ? (
          <Avatar player={game.joiner} size="lg" className="size-14 border-2" />
        ) : (
          <span className="inline-flex size-14 items-center justify-center rounded-full border-2 border-dashed border-white/20 text-xs text-white/40">
            ?
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 items-center gap-2 lg:grid-cols-2">
        <div className="flex w-56 flex-col items-center gap-1 md:items-start">
          <div className="flex items-center justify-center -space-x-4 overflow-hidden md:justify-start">
            {game.items.slice(0, 4).map((item) => (
              <ItemChip key={item.id} item={item} size="lg" />
            ))}
            {game.items.length > 4 ? (
              <span className="pl-4 text-xs text-white/50">+{game.items.length - 4}</span>
            ) : null}
          </div>
          <p className="max-w-52 truncate text-xs text-white/55">
            {game.items.map((item) => item.name).join(", ")}
          </p>
        </div>
        <div className="hidden lg:block" />
      </div>

      <div className="flex w-36 flex-col text-center">
        <ValueGem amount={total} className="justify-center text-base font-semibold" />
        <div className="text-sm opacity-50">
          {formatRange(Math.round(total * 0.95), Math.round(total * 1.05))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {showJoin && game.status === "open" && onJoin ? (
          <Button type="button" size="sm" onClick={onJoin}>
            Join
          </Button>
        ) : null}
        {onCancel && game.status === "open" && !game.joiner ? (
          <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="secondary" onClick={onView}>
          View
        </Button>
      </div>
    </div>
  );
}
