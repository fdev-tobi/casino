import { Gem } from "lucide-react";

import { formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ValueGem({
  amount,
  className,
  muted = false,
  hideAmount = false,
}: {
  amount: number;
  className?: string;
  muted?: boolean;
  hideAmount?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold tabular-nums",
        muted ? "text-white/50" : "text-foreground",
        className,
      )}
    >
      <Gem className={cn("size-3.5 shrink-0 text-primary", muted && "text-white/50")} aria-hidden="true" />
      {hideAmount ? null : formatValue(amount)}
    </span>
  );
}
