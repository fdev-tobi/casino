"use client";

import { Gamepad2, Home, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function BottomNav({
  onGames,
  onChat,
}: {
  onGames: () => void;
  onChat: () => void;
}) {
  const pathname = usePathname();
  const homeActive = pathname === "/";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[#0d111c]/95 backdrop-blur"
    >
      <div className="mx-auto grid h-14 max-w-5xl grid-cols-3">
        <Link
          href="/"
          className={cn(
            "inline-flex flex-col items-center justify-center gap-0.5 text-xs",
            homeActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Home className="size-5" aria-hidden="true" />
          Home
        </Link>
        <button
          type="button"
          onClick={onGames}
          className="inline-flex flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Gamepad2 className="size-5" aria-hidden="true" />
          Games
        </button>
        <button
          type="button"
          onClick={onChat}
          className="inline-flex flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          Chat
        </button>
      </div>
    </nav>
  );
}
