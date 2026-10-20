"use client";

import { AlertTriangle, Check, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

const PHRASE_WORDS = [
  "AIR",
  "ADMINISTRATION",
  "EVENING",
  "BOX",
  "THAT",
  "PREMIUM",
  "RIVER",
  "SILVER",
  "ORBIT",
  "LANTERN",
  "CIRCUIT",
  "HAVEN",
  "MIRROR",
  "SIGNAL",
  "QUARTZ",
  "EMBER",
] as const;

function buildPhrase() {
  const picks: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    picks.push(PHRASE_WORDS[Math.floor(Math.random() * PHRASE_WORDS.length)]);
  }
  return picks.join(" ");
}

export function LoginDialog() {
  const { loginOpen, setLoginOpen, login } = useAuth();
  const [username, setUsername] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [copied, setCopied] = useState(false);
  const [phrase, setPhrase] = useState("");

  const trimmedUsername = username.trim();
  const hasUsername = trimmedUsername.length >= 2;
  const showPhrase = trimmedUsername.length > 0;

  useEffect(() => {
    if (!loginOpen) {
      setUsername("");
      setAgreed(true);
      setCopied(false);
      setPhrase("");
    }
  }, [loginOpen]);

  useEffect(() => {
    if (!loginOpen || !showPhrase) return;
    if (!phrase) {
      setPhrase(buildPhrase());
    }
  }, [loginOpen, showPhrase, phrase]);

  const canSubmit = hasUsername && agreed && Boolean(phrase);

  async function copyPhrase() {
    if (!phrase) return;
    try {
      await navigator.clipboard.writeText(phrase);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold sm:text-2xl">
            Welcome to {brand.name.toLowerCase()}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/60">
            By logging in, you acknowledge that you are at least 18 years of age, that any items you
            wager are not stolen, and that you agree to our Terms of Use.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-2 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) return;
            login(username);
          }}
        >
          <label className="grid gap-2">
            <span className="sr-only">Username</span>
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username..."
              aria-label="Username"
              autoComplete="username"
              autoFocus
              className="h-11 rounded-lg border-transparent bg-input font-medium"
            />
          </label>

          {showPhrase ? (
            <div className="grid gap-2">
              <p className="text-sm text-foreground">
                Please add the following phrase to your profile&apos;s bio/about me page:
              </p>
              <div className="flex items-start gap-2 rounded-lg bg-input px-3 py-3">
                <code className="min-w-0 flex-1 break-words text-sm font-semibold tracking-wide uppercase text-white/90">
                  {phrase || "Generating…"}
                </code>
                <button
                  type="button"
                  onClick={copyPhrase}
                  disabled={!phrase}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-primary transition hover:bg-primary/10 disabled:opacity-40"
                  aria-label={copied ? "Copied" : "Copy phrase"}
                >
                  {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
                </button>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-red-500/60 bg-red-950/50 px-3 py-3 text-sm text-red-200">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden="true" />
                <p>We recommend removing this from your profile after you log in</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/45">Enter a username to receive your verification phrase.</p>
          )}

          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <span
              className={cn(
                "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-sm border-2",
                agreed ? "border-primary bg-primary text-primary-foreground" : "border-white/40 bg-transparent",
              )}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="sr-only"
              />
              {agreed ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : null}
            </span>
            <span className="text-white/80">
              By checking this box you agree to{" "}
              <Link href="/legal/terms" className="font-semibold text-primary hover:underline">
                our terms and service
              </Link>
            </span>
          </label>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full text-base font-bold"
            disabled={!canSubmit}
          >
            Login
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
