import { Gem } from "lucide-react";

import { formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ValueGem({
  amount,
  className,
  muted = false,
}: {
  amount: number;
  className?: string;
  muted?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-semibold tabular-nums", muted ? "text-muted-foreground" : "text-foreground", className)}>
      <Gem className={cn("size-3.5", muted ? "text-muted-foreground" : "text-primary")} aria-hidden="true" />
      {formatValue(amount)}
    </span>
  );
}
