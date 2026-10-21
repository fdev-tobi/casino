"use client";

import { Gem, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useInventory } from "@/components/lobby/inventory-provider";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatRange, formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DemoItem } from "@/types/lobby";

type SortMode = "high-low" | "low-high";

export function SelectInventoryDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  targetValue,
  rangeMin,
  rangeMax,
  onConfirm,
  onDepositClick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  /** Optional: require selection near this host value. */
  targetValue?: number;
  rangeMin?: number;
  rangeMax?: number;
  onConfirm: (items: DemoItem[]) => void;
  onDepositClick?: () => void;
}) {
  const { items, ready } = useInventory();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("high-low");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSort("high-low");
      setSelectedIds([]);
    }
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((item) => !q || item.name.toLowerCase().includes(q));
    return [...filtered].sort((a, b) =>
      sort === "high-low" ? b.value - a.value : a.value - b.value,
    );
  }, [items, query, sort]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );
  const total = selectedItems.reduce((sum, item) => sum + item.value, 0);

  const min = rangeMin ?? (targetValue != null ? Math.round(targetValue * 0.95) : undefined);
  const max = rangeMax ?? (targetValue != null ? Math.round(targetValue * 1.05) : undefined);
  const inRange =
    min == null || max == null ? selectedItems.length > 0 : total >= min && total <= max && selectedItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,40rem)] w-[min(100%-1.5rem,42rem)] flex-col gap-0 overflow-hidden p-0 sm:w-[min(100%-1.5rem,42rem)] sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4 sm:px-5">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-white/55">
            {description ||
              (min != null && max != null
                ? `Select pets totaling ${formatRange(min, max)} to join.`
                : "Select pets from your inventory.")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col px-4 pt-3 sm:px-5">
          <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/35" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for an item.."
                className="h-10 rounded-md border-border bg-input pl-9"
              />
            </label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="h-10 rounded-md border border-border bg-input px-3 text-sm font-semibold"
              aria-label="Sort"
            >
              <option value="high-low">High - Low</option>
              <option value="low-high">Low - High</option>
            </select>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border bg-[#121218] p-3">
            {!ready ? (
              <p className="py-16 text-center text-sm text-white/45">Loading inventory…</p>
            ) : visible.length === 0 ? (
              <div className="flex min-h-[14rem] flex-col items-center justify-center gap-3 text-center">
                <p className="text-xl font-bold">No Items!</p>
                <p className="text-sm text-white/50">Deposit pets to your wallet first.</p>
                {onDepositClick ? (
                  <Button type="button" className="rounded-md font-bold" onClick={onDepositClick}>
                    Open wallet
                  </Button>
                ) : null}
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {visible.map((item) => {
                  const selected = selectedIds.includes(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIds((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((id) => id !== item.id)
                              : [...prev, item.id],
                          )
                        }
                        className={cn(
                          "flex w-full flex-col items-center gap-2 rounded-lg border bg-[#1c1e27] px-2 py-3 text-center",
                          selected
                            ? "border-primary ring-1 ring-primary"
                            : "border-transparent hover:border-white/15",
                        )}
                      >
                        <ItemChip item={item} size="lg" />
                        <span className="line-clamp-2 w-full text-xs font-semibold">{item.name}</span>
                        <ValueGem amount={item.value} className="text-xs" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-3 flex shrink-0 flex-col gap-2 border-t border-border bg-[#0e0f14] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="text-sm">
            <span className="text-white/50">Selected </span>
            <span className="font-bold tabular-nums">{formatValue(total)}</span>
            {min != null && max != null ? (
              <span className="ml-2 text-xs text-white/40">range {formatRange(min, max)}</span>
            ) : null}
          </div>
          <Button
            type="button"
            className="h-11 rounded-md px-6 font-bold"
            disabled={!inRange}
            onClick={() => onConfirm(selectedItems)}
          >
            <span className="inline-flex items-center gap-2">
              {confirmLabel}
              <Gem className="size-4" aria-hidden="true" />
              {formatValue(total)}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
