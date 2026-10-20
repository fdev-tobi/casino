"use client";

import { AlertTriangle, Check, Copy, LoaderCircle } from "lucide-react";
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

type Step = "username" | "verify";

export function LoginDialog() {
  const { loginOpen, setLoginOpen, login } = useAuth();
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [resolvedUsername, setResolvedUsername] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [copied, setCopied] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loginOpen) {
      setStep("username");
      setUsername("");
      setResolvedUsername("");
      setAgreed(true);
      setCopied(false);
      setPhrase("");
      setChallengeId("");
      setBusy(false);
      setError(null);
    }
  }, [loginOpen]);

  const trimmedUsername = username.trim();
  const canRequestCode = trimmedUsername.length >= 3 && agreed && !busy;
  const canVerify = Boolean(challengeId && phrase) && agreed && !busy;

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

  async function requestCode() {
    if (!canRequestCode) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername }),
      });
      const json = (await response.json()) as {
        ok: boolean;
        error?: string;
        challengeId?: string;
        phrase?: string;
        username?: string;
      };
      if (!response.ok || !json.ok || !json.challengeId || !json.phrase) {
        setError(json.error || "Could not create a verification code.");
        return;
      }
      setChallengeId(json.challengeId);
      setPhrase(json.phrase);
      setResolvedUsername(json.username || trimmedUsername);
      setStep("verify");
    } catch {
      setError("Could not create a verification code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyAndLogin() {
    if (!canVerify) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });
      const json = (await response.json()) as {
        ok: boolean;
        error?: string;
        code?: string;
        username?: string;
      };
      if (!response.ok || !json.ok || !json.username) {
        setError(
          json.error ||
            "We could not find your verification code in your Roblox profile. Add it to your About section and try again.",
        );
        return;
      }
      login(json.username);
    } catch {
      setError("Verification failed. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold sm:text-2xl">Welcome to {brand.name}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/60">
            Sign in with your Roblox username. You must place a one-time code in your Roblox About
            section before login is allowed.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-2 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (step === "username") {
              void requestCode();
              return;
            }
            void verifyAndLogin();
          }}
        >
          <label className="grid gap-2">
            <span className="text-sm font-medium text-white/70">Roblox username</span>
            <Input
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (step === "verify") {
                  setStep("username");
                  setChallengeId("");
                  setPhrase("");
                  setError(null);
                }
              }}
              placeholder="Enter your Roblox username..."
              aria-label="Roblox username"
              autoComplete="username"
              autoFocus
              disabled={busy}
              className="h-11 rounded-lg border-transparent bg-input font-medium"
            />
          </label>

          {step === "verify" ? (
            <div className="grid gap-2">
              <p className="text-sm text-foreground">
                Add this code to <span className="font-semibold">{resolvedUsername}</span>
                &apos;s Roblox About / bio, save the profile, then verify:
              </p>
              <div className="flex items-start gap-2 rounded-lg bg-input px-3 py-3">
                <code className="min-w-0 flex-1 break-words text-sm font-semibold tracking-wide uppercase text-white/90">
                  {phrase}
                </code>
                <button
                  type="button"
                  onClick={copyPhrase}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-primary transition hover:bg-primary/10"
                  aria-label={copied ? "Copied" : "Copy phrase"}
                >
                  {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
                </button>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-950/40 px-3 py-3 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                <p>Remove the code from your profile after you finish logging in.</p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/60 bg-red-950/50 px-3 py-3 text-sm text-red-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : null}

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
            disabled={step === "username" ? !canRequestCode : !canVerify}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                {step === "username" ? "Checking username…" : "Verifying profile…"}
              </span>
            ) : step === "username" ? (
              "Login"
            ) : (
              "Verify & login"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
