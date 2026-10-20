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
    <div className="fixed bottom-0 left-0 z-30 flex h-20 w-full items-stretch bg-chat xl:hidden">
      <Link
        href="/"
        aria-label="menu"
        className={cn(
          "flex flex-1 items-center justify-center border-b-2 text-xl transition",
          homeActive ? "border-b-primary text-primary" : "border-b-transparent text-white",
        )}
      >
        <Home className="size-5" aria-hidden="true" />
      </Link>
      <button
        type="button"
        aria-label="games"
        onClick={onGames}
        className="flex flex-1 items-center justify-center border-b-2 border-b-transparent text-xl text-white transition"
      >
        <Gamepad2 className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="chat"
        onClick={onChat}
        className="flex flex-1 items-center justify-center border-b-2 border-b-transparent text-xl text-white transition"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
