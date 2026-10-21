"use client";

import { Check, Copy, ExternalLink, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { useInventory } from "@/components/lobby/inventory-provider";
import { ItemChip } from "@/components/lobby/item-chip";
import { ValueGem } from "@/components/lobby/value-gem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DemoItem } from "@/types/lobby";

type PublicSession = {
  id: string;
  status: "waiting_join" | "in_game" | "awaiting_trade" | "completed" | "expired" | "cancelled";
  botUsername: string;
  joinUrl: string;
  placeId: number;
  message: string;
  items: DemoItem[];
  expiresAt: number;
  updatedAt: number;
};

export function DepositBotPanel({ onDone }: { onDone: () => void }) {
  const { user, openLogin } = useAuth();
  const { depositMany } = useInventory();
  const [session, setSession] = useState<PublicSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const creditedRef = useRef<string | null>(null);

  // Start a live deposit session as soon as the panel opens (logged-in user).
  useEffect(() => {
    if (!user?.userId) return;
    let cancelled = false;

    async function start() {
      setBusy(true);
      setError(null);
      try {
        const response = await fetch("/api/deposit/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user!.userId, username: user!.username }),
        });
        const json = (await response.json()) as {
          ok: boolean;
          error?: string;
          session?: PublicSession;
        };
        if (cancelled) return;
        if (!response.ok || !json.ok || !json.session) {
          setError(json.error || "Could not start deposit.");
          return;
        }
        setSession(json.session);
        // Older logins may lack userId in localStorage; session create resolves it.
      } catch {
        if (!cancelled) setError("Could not start deposit. Try again.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Poll Roblox presence via our API until complete.
  useEffect(() => {
    if (!session || session.status === "completed" || session.status === "expired") return;

    let cancelled = false;
    const tick = async () => {
      try {
        const response = await fetch(`/api/deposit/sessions/${session.id}`, { cache: "no-store" });
        const json = (await response.json()) as {
          ok: boolean;
          session?: PublicSession;
          error?: string;
        };
        if (cancelled || !json.ok || !json.session) return;
        setSession(json.session);
      } catch {
        // keep polling
      }
    };

    void tick();
    const timer = window.setInterval(() => void tick(), 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session?.id, session?.status]);

  // Credit inventory once when the session completes.
  useEffect(() => {
    if (!session || session.status !== "completed") return;
    if (creditedRef.current === session.id) return;
    creditedRef.current = session.id;
    if (session.items.length > 0) {
      depositMany(session.items);
    }
  }, [session, depositMany]);

  async function copyBotName() {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.botUsername);
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
    if (!session) return;
    window.open(session.joinUrl, "_blank", "noopener,noreferrer");
  }

  if (!user) {
    return (
      <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-bold">Login required</p>
        <p className="text-sm text-white/50">Sign in with Roblox before depositing pets.</p>
        <Button type="button" className="rounded-md font-bold" onClick={openLogin}>
          Login
        </Button>
      </div>
    );
  }

  if (!user.userId) {
    return (
      <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-bold">Reconnect Roblox</p>
        <p className="text-sm text-white/50">
          Log out and verify login again so we can detect you in Adopt Me.
        </p>
        <Button type="button" className="rounded-md font-bold" onClick={openLogin}>
          Login again
        </Button>
      </div>
    );
  }

  const status = session?.status;
  const live =
    status === "waiting_join" || status === "in_game" || status === "awaiting_trade";

  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center gap-5 px-2 py-4 text-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-[#1c1e27] px-4 py-5">
        <p className="text-xs font-semibold tracking-wide uppercase text-white/40">Deposit bot</p>
        <p className="mt-1 text-xl font-bold">{session?.botUsername ?? "…"}</p>
        <button
          type="button"
          onClick={copyBotName}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          disabled={!session}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy bot username"}
        </button>

        <div
          className={cn(
            "mt-5 rounded-lg border px-3 py-3 text-sm font-medium",
            status === "completed"
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-white/10 bg-black/30 text-white/80",
          )}
        >
          {busy && !session ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin" />
              Starting deposit…
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              {live ? <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" /> : null}
              {error || session?.message || "Preparing deposit…"}
            </span>
          )}
        </div>

        <Button
          type="button"
          className="mt-4 h-12 w-full gap-2 rounded-md text-base font-bold"
          disabled={!session || status === "completed"}
          onClick={joinGame}
        >
          Join Game
          <ExternalLink className="size-4 opacity-80" aria-hidden="true" />
        </Button>

        <p className="mt-3 text-xs leading-5 text-white/40">
          We watch your Roblox presence. Once you&apos;re in Adopt Me and trade{" "}
          <span className="text-white/70">{session?.botUsername ?? "the bot"}</span>, pets land in
          your site inventory automatically — no confirm button.
        </p>
      </div>

      {status === "completed" && session?.items?.length ? (
        <div className="w-full max-w-md rounded-xl border border-primary/40 bg-primary/10 px-4 py-4 text-left">
          <p className="mb-3 text-sm font-bold text-primary">
            +{session.items.length} pet{session.items.length === 1 ? "" : "s"} added
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {session.items.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className="flex items-center gap-2 rounded-md bg-[#121218] px-2 py-2"
              >
                <ItemChip item={item} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{item.name}</p>
                  <ValueGem amount={item.value} className="text-[0.65rem]" />
                </div>
              </li>
            ))}
          </ul>
          <Button type="button" className="mt-4 w-full rounded-md font-bold" onClick={onDone}>
            Continue to coinflip
          </Button>
        </div>
      ) : null}
    </div>
  );
}
