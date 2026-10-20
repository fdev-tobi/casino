import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

function Separator({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("border-0 border-t border-border", className)} {...props} />;
}

export { Separator };
