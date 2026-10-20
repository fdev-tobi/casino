"use client";

import { Gem } from "lucide-react";

import { useDisplayValues } from "@/components/lobby/display-values-provider";
import { formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ValueGem({
  amount,
  itemId,
  className,
  muted = false,
  hideAmount = false,
}: {
  /** Fallback / game-logic amount when no display catalog hit exists. */
  amount: number;
  /** When set, prefer the display-only catalog amount for this id. */
  itemId?: string;
  className?: string;
  muted?: boolean;
  hideAmount?: boolean;
}) {
  const { getAmount, ready } = useDisplayValues();
  const displayAmount = ready && itemId ? getAmount(itemId, amount) : amount;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold tabular-nums",
        muted ? "text-white/50" : "text-foreground",
        className,
      )}
      title={itemId ? "Display value (guide only)" : undefined}
    >
      <Gem className={cn("size-3.5 shrink-0 text-primary", muted && "text-white/50")} aria-hidden="true" />
      {hideAmount ? null : formatValue(displayAmount)}
    </span>
  );
}
