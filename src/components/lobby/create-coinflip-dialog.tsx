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
import { formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CoinSide, DemoItem } from "@/types/lobby";

type SortMode = "high-low" | "low-high";
type PanelMode = "select" | "deposit";

export function CreateCoinflipDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: { items: DemoItem[]; side: CoinSide }) => void;
}) {
  const { items, catalog, deposit, ready } = useInventory();
  const [mode, setMode] = useState<PanelMode>("select");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("high-low");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [side, setSide] = useState<CoinSide>("heads");

  useEffect(() => {
    if (!open) {
      setMode("select");
      setQuery("");
      setSort("high-low");
      setSelectedIds([]);
      setSide("heads");
    }
  }, [open]);

  const source = mode === "select" ? items : catalog;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = source.filter((item) => !q || item.name.toLowerCase().includes(q));
    const ordered = [...filtered].sort((a, b) =>
      sort === "high-low" ? b.value - a.value : a.value - b.value,
    );
    return ordered;
  }, [source, query, sort]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  const total = selectedItems.reduce((sum, item) => sum + item.value, 0);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,40rem)] w-[min(100%-1.5rem,42rem)] flex-col gap-0 overflow-hidden p-0 sm:w-[min(100%-1.5rem,42rem)] sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4 sm:px-5">
          <DialogTitle className="text-xl font-bold">Create Coinflip</DialogTitle>
          <DialogDescription className="sr-only">
            Choose deposited pets and a coin side to create a match.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col px-4 pt-3 sm:px-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white/70">
              {mode === "select" ? "Select Item" : "Deposit Items"}
            </p>
            {mode === "deposit" ? (
              <button
                type="button"
                className="text-sm font-semibold text-primary hover:underline"
                onClick={() => setMode("select")}
              >
                Back to inventory
              </button>
            ) : null}
          </div>

          <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
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
              className="h-10 rounded-md border border-border bg-input px-3 text-sm font-semibold text-foreground"
              aria-label="Sort items"
            >
              <option value="high-low">High - Low</option>
              <option value="low-high">Low - High</option>
            </select>
            <select
              value="adoptme"
              disabled
              className="h-10 rounded-md border border-border bg-input px-3 text-sm font-semibold text-foreground opacity-90"
              aria-label="Game"
            >
              <option value="adoptme">Adopt Me</option>
            </select>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md border border-border bg-[#121218]/p-3">
            {!ready ? (
              <p className="py-16 text-center text-sm text-white/45">Loading inventory…</p>
            ) : visible.length === 0 ? (
              <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 px-4 text-center">
                <p className="text-2xl font-bold">No Items!</p>
                <p className="text-sm text-white/50">
                  {mode === "select"
                    ? "Your inventory seems to be empty..."
                    : "No pets match that search."}
                </p>
                {mode === "select" ? (
                  <Button type="button" className="mt-1 rounded-md px-6 font-bold" onClick={() => setMode("deposit")}>
                    Deposit Items
                  </Button>
                ) : null}
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {visible.map((item) => {
                  const selected = mode === "select" && selectedIds.includes(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (mode === "deposit") {
                            deposit(item);
                            setMode("select");
                            return;
                          }
                          toggleSelect(item.id);
                        }}
                        className={cn(
                          "flex w-full flex-col items-center gap-2 rounded-lg border bg-[#1c1e27] px-2 py-3 text-center transition",
                          selected
                            ? "border-primary ring-1 ring-primary"
                            : "border-transparent hover:border-white/15",
                        )}
                      >
                        <ItemChip item={item} size="lg" />
                        <span className="line-clamp-2 w-full text-xs font-semibold leading-4 text-white/85">
                          {item.name}
                        </span>
                        <ValueGem amount={item.value} className="text-xs" />
                        {mode === "deposit" ? (
                          <span className="text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                            Deposit
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-3 flex shrink-0 flex-col items-stretch gap-3 border-t border-border bg-[#0e0f14] px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-5">
          {mode === "select" ? (
            <>
              <div className="flex items-center justify-center gap-2 sm:mr-auto">
                <SideButton
                  label="H"
                  active={side === "heads"}
                  tone="heads"
                  onClick={() => setSide("heads")}
                />
                <SideButton
                  label="T"
                  active={side === "tails"}
                  tone="tails"
                  onClick={() => setSide("tails")}
                />
              </div>
              <Button
                type="button"
                className="h-11 rounded-md px-6 text-base font-bold"
                disabled={selectedItems.length === 0}
                onClick={() => onCreate({ items: selectedItems, side })}
              >
                <span className="inline-flex items-center gap-2">
                  Create With
                  <Gem className="size-4" aria-hidden="true" />
                  {formatValue(total)}
                </span>
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" className="h-11 rounded-md font-bold" onClick={() => setMode("select")}>
              Done depositing
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SideButton({
  label,
  active,
  tone,
  onClick,
}: {
  label: string;
  active: boolean;
  tone: CoinSide;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full text-sm font-bold text-white transition ring-2",
        tone === "heads" ? "bg-emerald-500" : "bg-orange-500",
        active ? "ring-white scale-105" : "ring-transparent opacity-55 hover:opacity-85",
      )}
      aria-label={tone === "heads" ? "Heads" : "Tails"}
    >
      {label}
    </button>
  );
}
