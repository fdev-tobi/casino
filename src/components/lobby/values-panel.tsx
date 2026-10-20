"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { useDisplayValues } from "@/components/lobby/display-values-provider";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 60;

function rarityTone(rarity: string | null): "amber" | "violet" | "cyan" | "rose" | "lime" | "slate" {
  switch ((rarity || "").toLowerCase()) {
    case "legendary":
      return "amber";
    case "ultra rare":
      return "violet";
    case "rare":
      return "cyan";
    case "uncommon":
      return "lime";
    case "common":
      return "slate";
    default:
      return "rose";
  }
}

export function ValuesPanel() {
  const { ready, items, sourceLabel, unitLabel } = useDisplayValues();
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const rarities = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.rarity) set.add(item.rarity);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (rarity !== "all" && (item.rarity || "").toLowerCase() !== rarity) {
        return false;
      }
      if (!deferredQuery) return true;
      const hay = `${item.name || ""} ${item.externalId}`.toLowerCase();
      return hay.includes(deferredQuery);
    });
  }, [items, deferredQuery, rarity]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="flex w-full flex-col px-4 pt-3 pb-32">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">Pet values</h1>
          <p className="mt-1 text-sm text-white/55">
            {ready
              ? `${items.length.toLocaleString()} display ${unitLabel}s from ${sourceLabel || "catalog"}`
              : "Loading display catalog…"}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search pets…"
            className="sm:w-64"
          />
          <select
            value={rarity}
            onChange={(event) => {
              setRarity(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm"
            aria-label="Filter by rarity"
          >
            <option value="all">All rarities</option>
            {rarities.map((entry) => (
              <option key={entry} value={entry.toLowerCase()}>
                {entry}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!ready ? (
        <p className="text-sm text-white/50">Loading pets…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-white/50">No pets match that search.</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {shown.map((item) => (
              <li
                key={item.externalId}
                className="flex flex-col items-center gap-2 rounded border border-border bg-card px-2 py-3 text-center"
              >
                <ItemChip
                  item={{
                    id: item.externalId,
                    name: item.name || item.externalId,
                    tone: rarityTone(item.rarity),
                    imageUrl: item.imageUrl,
                  }}
                  size="lg"
                />
                <span className="line-clamp-2 min-h-8 text-xs font-medium">{item.name}</span>
                {item.rarity ? (
                  <span className={cn("text-[10px] uppercase tracking-wide text-white/40")}>
                    {item.rarity}
                  </span>
                ) : null}
                <ValueGem
                  amount={item.amount ?? 0}
                  itemId={item.externalId}
                  className="text-sm"
                />
              </li>
            ))}
          </ul>
          {visible < filtered.length ? (
            <button
              type="button"
              className="mt-4 self-center rounded border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary"
              onClick={() => setVisible((count) => count + PAGE_SIZE)}
            >
              Show more ({filtered.length - visible} left)
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
