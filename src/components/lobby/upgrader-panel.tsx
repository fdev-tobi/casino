"use client";

import { useMemo, useState } from "react";

import { DemoNotice } from "@/components/lobby/demo-notice";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { liveWins, upgraderItems } from "@/lib/mock-data";
import type { UpgraderItem } from "@/types/lobby";
import { cn } from "@/lib/utils";

type SortId = "high-low" | "low-high" | "name";

export function UpgraderPanel() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("high-low");
  const [selected, setSelected] = useState<UpgraderItem[]>([]);
  const [desired, setDesired] = useState<UpgraderItem | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [loginNotice, setLoginNotice] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = upgraderItems.filter((item) => item.name.toLowerCase().includes(needle));
    switch (sort) {
      case "high-low":
        return [...list].sort((a, b) => b.value - a.value);
      case "low-high":
        return [...list].sort((a, b) => a.value - b.value);
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default: {
        const unreachable: never = sort;
        return unreachable;
      }
    }
  }, [query, sort]);

  const selectedTotal = selected.reduce((sum, item) => sum + item.value, 0);
  const desiredTotal = desired?.value ?? 0;
  const chance = selectedTotal > 0 && desiredTotal > 0 ? Math.min(99.9, (selectedTotal / desiredTotal) * 100) : 0;
  const multiplier = selectedTotal > 0 && desiredTotal > 0 ? desiredTotal / selectedTotal : 0;

  function toggleSelected(item: UpgraderItem) {
    setSelected((current) =>
      current.some((entry) => entry.id === item.id)
        ? current.filter((entry) => entry.id !== item.id)
        : [...current, item],
    );
  }

  return (
    <div className="grid gap-4">
      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase text-primary">
          <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
          Live wins
        </div>
        <ul className="flex gap-2 overflow-x-auto pb-2">
          {liveWins.map((win) => (
            <li key={win.id} className="min-w-[11rem] rounded-lg border border-border bg-card px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ValueGem amount={win.from} />
                <span className="text-primary">+{win.gain}</span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <ItemChip item={{ name: "from", tone: win.fromTone }} size="sm" />
                <span className="text-xs text-muted-foreground">→</span>
                <ItemChip item={{ name: "to", tone: win.toTone }} size="sm" />
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">{win.player}</p>
              <p className="text-xs font-semibold text-primary">{win.multiplier.toFixed(2)}x</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 rounded-xl border border-border bg-card p-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid place-items-center py-6">
          <div className="relative flex size-48 items-center justify-center rounded-full border border-border bg-[#0d111c] sm:size-56">
            <div
              className="absolute inset-0 rounded-full opacity-80"
              style={{
                background: `conic-gradient(var(--primary) ${chance * 3.6}deg, rgba(148,163,200,0.12) 0deg)`,
              }}
            />
            <div className="absolute inset-4 rounded-full bg-[#0d111c]" />
            <div className="relative z-10 text-center">
              <p className="text-3xl font-black">{chance.toFixed(2)}%</p>
              <p className="mt-1 max-w-[10rem] text-xs text-muted-foreground">
                Chance of receiving selected items
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">Multiplier: {multiplier.toFixed(2)}x</p>
            </div>
          </div>
          <div className="mt-4 grid w-full grid-cols-2 gap-3 text-center">
            <div className="rounded-md border border-border p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Selected total</p>
              <ValueGem amount={selectedTotal} className="mt-1 justify-center" />
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Desired total</p>
              <ValueGem amount={desiredTotal} className="mt-1 justify-center" />
            </div>
          </div>
          <Button type="button" className="mt-4 w-full" onClick={() => setNoticeOpen(true)}>
            Upgrade
          </Button>
          <div className="mt-3 w-full rounded-md border border-dashed border-border px-3 py-3 text-center text-sm text-muted-foreground">
            Not logged in
            <p className="mt-1 text-xs">You must be logged in to play upgrader</p>
            <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => setLoginNotice(true)}>
              Login
            </Button>
          </div>
        </div>

        <div>
          <label className="grid gap-2 text-sm">
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-muted-foreground">Select item</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for an item.."
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortId)}
              aria-label="Sort items"
            >
              <option value="high-low">High - Low</option>
              <option value="low-high">Low - High</option>
              <option value="name">Name</option>
            </select>
            <span className="inline-flex h-10 items-center rounded-md border border-primary/40 bg-primary/15 px-3 text-xs font-bold tracking-[0.12em] uppercase text-primary">
              Murder Mystery 2
            </span>
          </div>
          <ul className="mt-3 grid max-h-[28rem] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {filtered.map((item) => {
              const isSelected = selected.some((entry) => entry.id === item.id);
              const isDesired = desired?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      toggleSelected(item);
                      if (!desired) {
                        setDesired(item);
                      }
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setDesired(item);
                    }}
                    className={cn(
                      "flex w-full flex-col items-center gap-2 rounded-lg border bg-muted/30 px-2 py-3 text-center",
                      isSelected || isDesired ? "border-primary shadow-glow" : "border-border",
                    )}
                  >
                    <ItemChip item={item} />
                    <span className="line-clamp-2 text-xs font-medium">{item.name}</span>
                    <ValueGem amount={item.value} className="text-xs" />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Click to toggle selected items. Right-click sets the desired target.
          </p>
        </div>
      </section>

      <DemoNotice
        open={noticeOpen}
        onOpenChange={setNoticeOpen}
        title="Upgrade is demo only"
        description="No inventory is spent and no item is awarded in this prototype."
      />
      <DemoNotice
        open={loginNotice}
        onOpenChange={setLoginNotice}
        title="Login is not connected"
        description="Use the header Login button for the account placeholder."
      />
    </div>
  );
}
