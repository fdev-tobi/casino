"use client";

import { Gem, Search, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { DepositBotPanel } from "@/components/lobby/deposit-bot-panel";
import { useInventory } from "@/components/lobby/inventory-provider";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { useWallet } from "@/components/lobby/wallet-provider";
import { WithdrawBotPanel } from "@/components/lobby/withdraw-bot-panel";
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
import type { DemoItem } from "@/types/lobby";

type Mode = "inventory" | "deposit" | "withdraw";

export function WalletDialog() {
  const { walletOpen, setWalletOpen } = useWallet();
  const { user, openLogin } = useAuth();
  const { items, ready } = useInventory();
  const [mode, setMode] = useState<Mode>("inventory");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!walletOpen) {
      setMode("inventory");
      setQuery("");
      setSelectedIds([]);
    }
  }, [walletOpen]);

  const balance = useMemo(
    () => items.reduce((sum, item) => sum + item.value, 0),
    [items],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => !q || item.name.toLowerCase().includes(q))
      .sort((a, b) => b.value - a.value);
  }, [items, query]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  function toggle(item: DemoItem) {
    setSelectedIds((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
    );
  }

  return (
    <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
      <DialogContent className="flex max-h-[min(92dvh,42rem)] w-[min(100%-1.5rem,42rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4 sm:px-5">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Wallet className="size-5 text-primary" aria-hidden="true" />
            Wallet
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm text-white/60">
            Balance
            <span className="inline-flex items-center gap-1 font-bold text-foreground">
              <Gem className="size-3.5 text-primary" aria-hidden="true" />
              {formatValue(balance)}
            </span>
            <span className="text-white/35">· {items.length} items</span>
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
            <p className="font-semibold">Login to view your wallet</p>
            <Button
              type="button"
              onClick={() => {
                setWalletOpen(false);
                openLogin();
              }}
            >
              Login
            </Button>
          </div>
        ) : mode === "deposit" ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <button
              type="button"
              className="mb-3 text-sm font-semibold text-primary hover:underline"
              onClick={() => setMode("inventory")}
            >
              Back to inventory
            </button>
            <DepositBotPanel onDone={() => setMode("inventory")} />
          </div>
        ) : mode === "withdraw" ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <WithdrawBotPanel
              items={selectedItems}
              onCancel={() => setMode("inventory")}
              onDone={() => {
                setSelectedIds([]);
                setMode("inventory");
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col px-4 pt-3 sm:px-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/35" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search inventory…"
                    className="h-10 pl-9"
                  />
                </label>
                <Button type="button" variant="secondary" className="font-bold" onClick={() => setMode("deposit")}>
                  Deposit
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border bg-[#121218] p-3">
                {!ready ? (
                  <p className="py-16 text-center text-sm text-white/45">Loading…</p>
                ) : visible.length === 0 ? (
                  <div className="flex min-h-[14rem] flex-col items-center justify-center gap-3 text-center">
                    <p className="text-xl font-bold">Empty wallet</p>
                    <p className="text-sm text-white/50">Deposit Adopt Me pets to get started.</p>
                    <Button type="button" className="font-bold" onClick={() => setMode("deposit")}>
                      Deposit Items
                    </Button>
                  </div>
                ) : (
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {visible.map((item) => {
                      const selected = selectedIds.includes(item.id);
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => toggle(item)}
                            className={cn(
                              "flex w-full flex-col items-center gap-2 rounded-lg border bg-[#1c1e27] px-2 py-3",
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
              <p className="text-sm text-white/55">
                {selectedItems.length > 0
                  ? `${selectedItems.length} selected for withdraw`
                  : "Select pets to withdraw"}
              </p>
              <Button
                type="button"
                className="h-11 rounded-md font-bold"
                disabled={selectedItems.length === 0}
                onClick={() => setMode("withdraw")}
              >
                Withdraw
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
