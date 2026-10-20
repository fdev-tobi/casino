import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-muted/70 px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
