"use client";

import { useDisplayValues } from "@/components/lobby/display-values-provider";
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

type ChipItem = Pick<DemoItem, "name" | "tone"> & {
  id?: string;
  imageUrl?: string | null;
};

export function ItemChip({
  item,
  size = "md",
}: {
  item: ChipItem;
  size?: "sm" | "md" | "lg";
}) {
  const { getItem } = useDisplayValues();
  const catalogId = item.id?.includes("#") ? item.id.slice(0, item.id.indexOf("#")) : item.id;
  const catalog = catalogId ? getItem(catalogId) : undefined;
  const imageUrl = item.imageUrl || catalog?.imageUrl || null;
  const dim = size === "sm" ? "h-10 w-10" : size === "lg" ? "h-16 w-16" : "h-12 w-12";

  return (
    <span
      title={item.name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-transparent bg-gradient-to-br transition hover:border-primary",
        !imageUrl && toneClass[item.tone],
        imageUrl && "border-white/10 bg-black/40",
        dim,
      )}
    >
      {imageUrl ? (
        // AMVerse CDN is more reliable without a localhost Referer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full object-contain p-1"
        />
      ) : (
        <span className="size-2.5 rounded-full bg-white/80" />
      )}
    </span>
  );
}
