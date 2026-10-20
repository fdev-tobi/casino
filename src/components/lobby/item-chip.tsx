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
  size?: "sm" | "md";
}) {
  return (
    <span
      title={item.name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]",
        toneClass[item.tone],
        size === "sm" ? "size-8" : "size-10",
      )}
    >
      <span className="size-2 rounded-full bg-white/80" />
    </span>
  );
}
