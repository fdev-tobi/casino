import { cn } from "@/lib/utils";
import type { DemoPlayer } from "@/types/lobby";

export function Avatar({
  player,
  size = "md",
  className,
}: {
  player: Pick<DemoPlayer, "initials" | "color" | "name">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = size === "sm" ? "size-8 text-[0.65rem]" : size === "lg" ? "size-14 text-base" : "size-10 text-xs";
  return (
    <span
      title={player.name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 font-bold text-white",
        sizeClass,
        className,
      )}
      style={{ background: player.color }}
    >
      {player.initials}
    </span>
  );
}
