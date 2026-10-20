import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary">404</p>
      <h1 className="mt-3 text-4xl font-bold">That page is not on the floor</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        The link may be mistyped, or the mode is not part of this demonstration lobby.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-6 inline-flex")}>
        Back to CoinFlip
      </Link>
    </div>
  );
}
