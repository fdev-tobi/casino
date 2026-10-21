"use client";

import { Check, Copy, ExternalLink, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { useInventory } from "@/components/lobby/inventory-provider";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import { depositConfig } from "@/config/deposit";
import type { DemoItem } from "@/types/lobby";

type Phase = "ready" | "joined" | "waiting" | "done";

/**
 * Withdraw flow UI (bot trade). Completing removes selected pets from site inventory
 * once the user joins Adopt Me and confirms the bot trade — same channel as deposit.
 */
export function WithdrawBotPanel({
  items,
  onDone,
  onCancel,
}: {
  items: DemoItem[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const { user, openLogin } = useAuth();
  const { removeByIds } = useInventory();
  const [phase, setPhase] = useState<Phase>("ready");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (phase !== "waiting") return;
    const timer = window.setTimeout(() => {
      removeByIds(items.map((item) => item.id));
      setPhase("done");
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [phase, items, removeByIds]);

  async function copyBot() {
    try {
      await navigator.clipboard.writeText(depositConfig.botUsername);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  function joinGame() {
    if (!user) {
      openLogin();
      return;
    }
    window.open(depositConfig.joinUrl, "_blank", "noopener,noreferrer");
    setPhase("joined");
  }

  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-[#1c1e27] px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Withdrawing</p>
        <p className="mt-1 text-sm font-semibold">
          {items.length} pet{items.length === 1 ? "" : "s"} · <ValueGem amount={total} className="inline text-sm" />
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-1.5 rounded-md bg-black/30 px-2 py-1">
              <ItemChip item={item} size="sm" />
              <span className="max-w-[6rem] truncate text-xs">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-[#1c1e27] px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Bot</p>
        <p className="text-base font-bold">{depositConfig.botUsername}</p>
        <button
          type="button"
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary"
          onClick={copyBot}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy name"}
        </button>
      </div>

      <p className="text-center text-sm text-white/55">
        Join the VIP / deposit server, trade the bot, and it will send your pets in-game.
      </p>

      {phase === "ready" || phase === "joined" ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" className="h-11 flex-1 gap-2 font-bold" onClick={joinGame}>
            Join Game
            <ExternalLink className="size-4 opacity-80" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-11 flex-1 font-bold"
            disabled={phase === "ready"}
            onClick={() => setPhase("waiting")}
          >
            I traded the bot
          </Button>
        </div>
      ) : null}

      {phase === "waiting" ? (
        <p className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary">
          <LoaderCircle className="size-4 animate-spin" />
          Bot is sending your pets…
        </p>
      ) : null}

      {phase === "done" ? (
        <div className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-3 text-center">
          <p className="text-sm font-bold text-primary">Withdraw complete</p>
          <p className="mt-1 text-xs text-white/55">Pets removed from your site wallet.</p>
          <Button type="button" className="mt-3 w-full font-bold" onClick={onDone}>
            Done
          </Button>
        </div>
      ) : (
        <Button type="button" variant="secondary" className="font-bold" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}
