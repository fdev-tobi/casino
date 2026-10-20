"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { BottomNav } from "@/components/lobby/bottom-nav";
import { ChatPanel } from "@/components/lobby/chat-panel";
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
import { brand } from "@/config/brand";
import { footerLegal, gameModes } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [gamesOpen, setGamesOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader onLogin={() => setLoginOpen(true)} />

      <div className="mt-20 flex flex-1 overflow-auto">
        <ChatPanel
          className="hidden w-1/4 min-w-[22rem] flex-col gap-2 bg-chat px-3 pt-3 xl:flex"
          onSendAttempt={() => setNoticeOpen(true)}
        />

        <div className="flex w-full flex-col overflow-auto">
          <StatusBanner />
          <main id="content" className="flex-1">
            {children}
          </main>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 p-3 text-sm text-white/40">
            <span>{brand.name} is a demonstration prototype. Not affiliated with ROBLOX corporation.</span>
            {footerLegal.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white/70">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav onGames={() => setGamesOpen(true)} onChat={() => setChatOpen(true)} />

      <Sheet open={gamesOpen} onOpenChange={setGamesOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Games</SheetTitle>
            <SheetDescription>Choose a demonstration mode.</SheetDescription>
          </SheetHeader>
          <nav className="mt-4 grid gap-1" aria-label="Mobile game modes">
            {gameModes.map((mode) => {
              const active = mode.href === "/" ? pathname === "/" : pathname.startsWith(mode.href);
              return (
                <Link
                  key={mode.id}
                  href={mode.href}
                  className={cn(
                    "inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold uppercase",
                    active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
                  )}
                  onClick={() => setGamesOpen(false)}
                >
                  {mode.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent className="bg-chat p-3">
          <SheetHeader className="sr-only">
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription>Mock lobby chat.</SheetDescription>
          </SheetHeader>
          <ChatPanel className="flex h-full flex-col gap-2" onSendAttempt={() => setNoticeOpen(true)} />
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
              size="lg"
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
