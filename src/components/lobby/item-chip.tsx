import { cn } from "@/lib/utils";
import type { DemoItem } from "@/types/lobby";

const toneClass: Record<DemoItem["tone"], string> = {
  amber: "from-amber-400/90 to-orange-600/80",
  violet: "from-violet-400/90 to-purple-700/80",
  cyan: "from-cyan-300/90 to-sky-600/80",
  rose: "from-rose-300/90 to-pink-700/80",
  lime: "from-lime-300/90 to-emerald-700/80",
  slate: "from-slate-300/90 to-slate-600/80",
};

export function ItemChip({
  item,
  size = "md",
}: {
  item: Pick<DemoItem, "name" | "tone">;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "h-10 w-10" : size === "lg" ? "h-16 w-16" : "h-12 w-12";
  return (
    <span
      title={item.name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-transparent bg-gradient-to-br transition hover:border-primary",
        toneClass[item.tone],
        dim,
      )}
    >
      <span className="size-2.5 rounded-full bg-white/80" />
    </span>
  );
}
