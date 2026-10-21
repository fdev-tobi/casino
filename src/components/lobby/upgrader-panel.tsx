"use client";

import { Children, useMemo, useRef, useState, type ReactNode } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { Avatar } from "@/components/lobby/avatar";
import { useDisplayValues } from "@/components/lobby/display-values-provider";
import { useInventory } from "@/components/lobby/inventory-provider";
import { ItemChip } from "@/components/lobby/item-chip";
import { UpgraderWheel } from "@/components/lobby/upgrader-wheel";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { liveWins, upgraderItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { DemoItem, UpgraderItem } from "@/types/lobby";

type SortId = "high-low" | "low-high" | "name";

function sortItems<T extends { id: string; name: string; value: number }>(
  list: readonly T[],
  sort: SortId,
  getAmount: (id: string | undefined, fallback?: number) => number,
): T[] {
  switch (sort) {
    case "high-low":
      return [...list].sort((a, b) => getAmount(b.id, b.value) - getAmount(a.id, a.value));
    case "low-high":
      return [...list].sort((a, b) => getAmount(a.id, a.value) - getAmount(b.id, b.value));
    case "name":
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    default: {
      const unreachable: never = sort;
      return unreachable;
    }
  }
}

export function UpgraderPanel() {
  const { user, openLogin } = useAuth();
  const { getAmount, sumAmounts } = useDisplayValues();
  const { items: inventory, deposit, removeByIds, ready } = useInventory();
  const [invQuery, setInvQuery] = useState("");
  const [stockQuery, setStockQuery] = useState("");
  const [sort, setSort] = useState<SortId>("high-low");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [desired, setDesired] = useState<UpgraderItem | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinToken, setSpinToken] = useState(0);
  const selectedRef = useRef<DemoItem[]>([]);
  const desiredRef = useRef<UpgraderItem | null>(null);
  desiredRef.current = desired;

  const selected = useMemo(
    () => inventory.filter((item) => selectedIds.includes(item.id)),
    [inventory, selectedIds],
  );
  selectedRef.current = selected;

  const inventoryVisible = useMemo(() => {
    const needle = invQuery.trim().toLowerCase();
    const list = inventory.filter((item) => !needle || item.name.toLowerCase().includes(needle));
    return sortItems(list, sort, getAmount);
  }, [inventory, invQuery, sort, getAmount]);

  const stockVisible = useMemo(() => {
    const needle = stockQuery.trim().toLowerCase();
    const list = upgraderItems.filter((item) => !needle || item.name.toLowerCase().includes(needle));
    return sortItems(list, sort, getAmount);
  }, [stockQuery, sort, getAmount]);

  const selectedTotal = sumAmounts(selected);
  const desiredTotal = desired ? getAmount(desired.id, desired.value) : 0;
  const chance =
    selectedTotal > 0 && desiredTotal > 0 ? Math.min(99.9, (selectedTotal / desiredTotal) * 100) : 0;
  const multiplier = selectedTotal > 0 && desiredTotal > 0 ? desiredTotal / selectedTotal : 0;

  function toggleInventoryItem(item: DemoItem) {
    if (spinning) return;
    setSelectedIds((current) =>
      current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id],
    );
  }

  function upgrade() {
    if (!user) {
      openLogin();
      return;
    }
    if (spinning) return;
    if (!desired || selected.length === 0) {
      setResult("Select inventory pets on the left and a target on the right.");
      return;
    }
    if (desiredTotal <= selectedTotal) {
      setResult("Pick a higher-value target than your selected total.");
      return;
    }
    setResult(null);
    setSpinning(true);
    setSpinToken((token) => token + 1);
  }

  function handleSpinEnd(won: boolean) {
    setSpinning(false);
    const stake = selectedRef.current;
    const target = desiredRef.current;
    if (!target) return;

    // Stake is always consumed.
    removeByIds(stake.map((item) => item.id));
    setSelectedIds([]);

    if (won) {
      deposit({
        id: target.id,
        name: target.name,
        value: target.value,
        tone: target.tone,
        imageUrl: target.imageUrl,
      });
      setResult(`Won ${target.name}! Added to your inventory.`);
    } else {
      setResult("Upgrade missed — stake pets removed.");
    }
  }

  return (
    <div className="flex w-full flex-col gap-3 px-3 pt-3 pb-32 sm:px-4">
      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-primary">
          <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
          Live wins
        </div>
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {liveWins.map((win) => (
            <li key={win.id} className="min-w-[11rem] rounded-[4px] border border-border bg-card px-4 py-2">
              <div className="flex items-center gap-2 text-sm font-medium">
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

      <section className="grid gap-3 rounded border bg-card p-3 lg:grid-cols-[1fr_minmax(16rem,22rem)_1fr] lg:p-4">
        {/* Left: your inventory */}
        <ItemColumn
          title="Your inventory"
          hint="Select pets to risk"
          query={invQuery}
          onQueryChange={setInvQuery}
          sort={sort}
          onSortChange={setSort}
          disabled={spinning}
          empty={
            !ready
              ? "Loading…"
              : inventory.length === 0
                ? "Inventory empty — deposit pets from CoinFlip first."
                : "No pets match your search."
          }
        >
          {inventoryVisible.map((item) => {
            const active = selectedIds.includes(item.id);
            return (
              <ItemTile
                key={item.id}
                item={item}
                active={active}
                disabled={spinning}
                badge={active ? "Stake" : null}
                onClick={() => toggleInventoryItem(item)}
              />
            );
          })}
        </ItemColumn>

        {/* Center: wheel */}
        <div className="order-first flex flex-col items-center py-2 lg:order-none">
          <UpgraderWheel
            chance={chance}
            spinning={spinning}
            spinKey={spinToken}
            onSpinEnd={handleSpinEnd}
          />
          <p className="mt-3 text-sm font-medium text-primary">Multiplier: {multiplier.toFixed(2)}x</p>
          <div className="mt-3 grid w-full grid-cols-2 gap-2 text-center">
            <div className="rounded-[4px] border border-border bg-background/50 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Your stake</p>
              <ValueGem amount={selectedTotal} className="mt-1 justify-center" />
            </div>
            <div className="rounded-[4px] border border-border bg-background/50 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Target</p>
              <ValueGem amount={desiredTotal} className="mt-1 justify-center" />
            </div>
          </div>
          <Button type="button" className="mt-4 w-full" disabled={spinning} onClick={upgrade}>
            {spinning ? "Spinning…" : "Upgrade"}
          </Button>
          {result && !spinning ? (
            <p
              className={cn(
                "mt-2 text-center text-sm font-semibold",
                result.startsWith("Won") ? "text-primary" : "text-rose-300",
              )}
            >
              {result}
            </p>
          ) : null}
          {user ? (
            <div className="mt-3 flex w-full items-center justify-center gap-3 rounded-[4px] border border-border px-3 py-3 text-sm">
              <Avatar
                player={{
                  name: user.username,
                  initials: user.username.slice(0, 2).toUpperCase(),
                  color: "#5468f1",
                  robloxUserId: user.userId,
                  avatarUrl: user.avatarUrl,
                }}
                size="sm"
                className="border border-primary"
              />
              <span className="font-semibold">{user.displayName || user.username}</span>
            </div>
          ) : (
            <div className="mt-3 w-full rounded-[4px] border border-dashed border-border px-3 py-3 text-center text-sm text-muted-foreground">
              Not logged in
              <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={openLogin}>
                Login
              </Button>
            </div>
          )}
        </div>

        {/* Right: site stock */}
        <ItemColumn
          title="Site stock"
          hint="Choose what you want"
          query={stockQuery}
          onQueryChange={setStockQuery}
          sort={sort}
          onSortChange={setSort}
          disabled={spinning}
          empty="No stock matches your search."
        >
          {stockVisible.map((item) => {
            const active = desired?.id === item.id;
            return (
              <ItemTile
                key={item.id}
                item={item}
                active={active}
                disabled={spinning}
                badge={active ? "Target" : null}
                onClick={() => {
                  if (!spinning) setDesired(item);
                }}
              />
            );
          })}
        </ItemColumn>
      </section>
    </div>
  );
}

function ItemColumn({
  title,
  hint,
  query,
  onQueryChange,
  sort,
  onSortChange,
  disabled,
  empty,
  children,
}: {
  title: string;
  hint: string;
  query: string;
  onQueryChange: (value: string) => void;
  sort: SortId;
  onSortChange: (value: SortId) => void;
  disabled: boolean;
  empty: string;
  children: ReactNode;
}) {
  const childCount = Children.count(children);

  return (
    <div className="flex min-h-0 flex-col rounded-lg border border-border bg-background/40 p-3">
      <div className="mb-2">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-white/45">{hint}</p>
      </div>
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search…"
        disabled={disabled}
        className="h-9"
      />
      <div className="mt-2 flex gap-2">
        <select
          className="h-9 flex-1 rounded-[6px] border border-border bg-card px-2 text-xs text-foreground"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortId)}
          aria-label={`Sort ${title}`}
          disabled={disabled}
        >
          <option value="high-low">High - Low</option>
          <option value="low-high">Low - High</option>
          <option value="name">Name</option>
        </select>
        <span className="inline-flex h-9 items-center rounded-[6px] border border-primary bg-primary/10 px-2 text-[0.65rem] font-semibold tracking-wide uppercase text-primary">
          Adopt Me
        </span>
      </div>
      <ul className="mt-3 grid max-h-[22rem] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-2 lg:max-h-[28rem]">
        {childCount === 0 ? (
          <li className="col-span-2 py-10 text-center text-xs text-white/45">{empty}</li>
        ) : (
          children
        )}
      </ul>
    </div>
  );
}

function ItemTile({
  item,
  active,
  disabled,
  badge,
  onClick,
}: {
  item: Pick<DemoItem, "id" | "name" | "value" | "tone" | "imageUrl">;
  active: boolean;
  disabled: boolean;
  badge: string | null;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "flex w-full flex-col items-center gap-1.5 rounded-[4px] border bg-card px-2 py-2.5 text-center disabled:opacity-50",
          active ? "border-primary ring-1 ring-primary" : "border-border",
        )}
      >
        <ItemChip item={item} />
        <span className="line-clamp-2 text-[0.7rem] font-medium leading-4">{item.name}</span>
        <ValueGem amount={item.value} itemId={item.id.includes("#") ? item.id.split("#")[0] : item.id} className="text-xs" />
        {badge ? (
          <span className="text-[0.6rem] font-bold uppercase tracking-wide text-primary">{badge}</span>
        ) : null}
      </button>
    </li>
  );
}
