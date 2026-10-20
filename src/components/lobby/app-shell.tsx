"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { BottomNav } from "@/components/lobby/bottom-nav";
import { DemoNotice } from "@/components/lobby/demo-notice";
import { StatusBanner } from "@/components/lobby/status-banner";
import { TopHeader } from "@/components/lobby/top-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { footerLegal, gameModes } from "@/config/navigation";
import { chatMessages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [gamesOpen, setGamesOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div className="flex min-h-full flex-col pb-14">
      <TopHeader onLogin={() => setLoginOpen(true)} />
      <StatusBanner />

      <div className="mx-auto flex w-full max-w-5xl flex-1 gap-0 lg:gap-6 lg:px-4">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-44 shrink-0 py-4 lg:block">
          <p className="mb-2 px-2 text-[0.65rem] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
            Modes
          </p>
          <nav aria-label="Game modes" className="grid gap-1">
            {gameModes.map((mode) => {
              const active = mode.href === "/" ? pathname === "/" : pathname.startsWith(mode.href);
              return (
                <Link
                  key={mode.id}
                  href={mode.href}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-semibold",
                    active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {mode.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 grid gap-1 px-2">
            {footerLegal.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </aside>

        <main id="content" className="min-w-0 flex-1 px-4 py-4 sm:py-6">
          {children}
        </main>
      </div>

      <BottomNav
        onGames={() => setGamesOpen(true)}
        onChat={() => setChatOpen(true)}
      />

      <Sheet open={gamesOpen} onOpenChange={setGamesOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Games</SheetTitle>
            <SheetDescription>Choose a demonstration mode.</SheetDescription>
          </SheetHeader>
          <nav className="mt-4 grid gap-1" aria-label="Mobile game modes">
            {gameModes.map((mode) => (
              <Link
                key={mode.id}
                href={mode.href}
                className="inline-flex min-h-11 items-center rounded-md px-3 text-base font-semibold"
                onClick={() => setGamesOpen(false)}
              >
                {mode.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription>Mock lobby chat. Messages are not live.</SheetDescription>
          </SheetHeader>
          <ul className="mt-4 grid max-h-[55vh] gap-3 overflow-y-auto">
            {chatMessages.map((message) => (
              <li key={message.id} className="rounded-md border border-border bg-card px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{message.user}</span>
                  <span>{message.at}</span>
                </div>
                <p className="mt-1 text-sm">{message.text}</p>
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setDraft("");
              setNoticeOpen(true);
            }}
          >
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a demo message"
              aria-label="Chat message"
            />
            <Button type="submit">Send</Button>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Authentication is not connected. This panel is a layout placeholder for the prototype.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Username" aria-label="Username" disabled />
            <Input placeholder="Password" type="password" aria-label="Password" disabled />
            <Button
              type="button"
              onClick={() => {
                setLoginOpen(false);
                setNoticeOpen(true);
              }}
            >
              Continue as guest preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DemoNotice
        open={noticeOpen}
        onOpenChange={setNoticeOpen}
        title="Demo only"
        description="Chat and login are presentation controls. No account is created and no message is sent."
      />
    </div>
  );
}
