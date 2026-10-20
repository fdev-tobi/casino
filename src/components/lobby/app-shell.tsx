"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AuthProvider } from "@/components/lobby/auth-provider";
import { BottomNav } from "@/components/lobby/bottom-nav";
import { ChatPanel } from "@/components/lobby/chat-panel";
import { DisplayValuesProvider } from "@/components/lobby/display-values-provider";
import { InventoryProvider } from "@/components/lobby/inventory-provider";
import { LoginDialog } from "@/components/lobby/login-dialog";
import { RobloxAvatarProvider } from "@/components/lobby/roblox-avatar-provider";
import { StatusBanner } from "@/components/lobby/status-banner";
import { TopHeader } from "@/components/lobby/top-header";
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

function ShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [gamesOpen, setGamesOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader />

      <div className="mt-16 flex min-h-0 flex-1 overflow-auto sm:mt-20">
        <ChatPanel className="hidden w-1/4 min-w-[22rem] flex-col gap-2 bg-chat px-3 pt-3 xl:flex" />

        <div className="flex w-full min-w-0 flex-col overflow-auto">
          <StatusBanner />
          <main id="content" className="min-w-0 flex-1">
            {children}
          </main>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 p-3 pb-24 text-center text-xs text-white/40 sm:text-sm xl:pb-3">
            <span>{brand.name} is not affiliated with ROBLOX corporation.</span>
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
            <SheetDescription>Choose a game mode.</SheetDescription>
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
            <SheetDescription>Lobby chat.</SheetDescription>
          </SheetHeader>
          <ChatPanel className="flex h-full flex-col gap-2" />
        </SheetContent>
      </Sheet>

      <LoginDialog />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DisplayValuesProvider>
        <RobloxAvatarProvider>
          <InventoryProvider>
            <ShellInner>{children}</ShellInner>
          </InventoryProvider>
        </RobloxAvatarProvider>
      </DisplayValuesProvider>
    </AuthProvider>
  );
}
