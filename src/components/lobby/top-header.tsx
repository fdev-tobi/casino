"use client";

import { Coins, Gauge, Gem, LogIn, LogOut, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { Avatar } from "@/components/lobby/avatar";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { gameModes } from "@/config/navigation";
import { cn } from "@/lib/utils";

const modeIcon: Record<(typeof gameModes)[number]["id"], ComponentType<SVGProps<SVGSVGElement>>> = {
  coinflip: Coins,
  jackpot: Gauge,
  upgrader: Zap,
  values: Gem,
  race: Trophy,
  leaderboard: Trophy,
};

function BrandMark() {
  return (
    <Link href="/" aria-label={brand.name}>
      <div className="flex h-fit min-w-0 items-center gap-2 sm:gap-3">
        <Image
          src={brand.mark.src}
          alt=""
          width={brand.mark.width}
          height={brand.mark.height}
          unoptimized
          className="size-[28px] shrink-0 sm:size-[30px]"
        />
        <div className="hidden h-[30px] w-[2px] bg-white sm:block" />
        <span className="truncate text-base font-bold uppercase sm:text-lg">{brand.name}</span>
      </div>
    </Link>
  );
}

function AuthControls() {
  const { user, openLogin, logout } = useAuth();

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3" suppressHydrationWarning>
      {user ? (
        <>
          <div className="flex min-w-0 items-center gap-2">
            <Avatar
              player={{
                name: user.username,
                initials: user.username.slice(0, 2).toUpperCase(),
                color: "#5468f1",
                robloxUserId: user.userId,
                avatarUrl: user.avatarUrl,
              }}
              size="sm"
              className="size-8 border-2 border-primary sm:size-9"
            />
            <span className="hidden max-w-[7rem] truncate text-sm font-semibold sm:inline md:max-w-[9rem]">
              {user.displayName || user.username}
            </span>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={logout} className="gap-1.5 px-3">
            <LogOut aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Logout</span>
          </Button>
        </>
      ) : (
        <Button type="button" size="sm" onClick={openLogin} className="h-10 gap-2 px-4 sm:h-11 sm:px-6">
          <LogIn aria-hidden="true" />
          Login
        </Button>
      )}
    </div>
  );
}

export function TopHeader() {
  const pathname = usePathname();

  return (
    <nav className="fixed z-40 flex h-16 w-full items-center justify-between border-b bg-nav px-3 sm:h-20 sm:px-6 xl:px-8">
      <div className="hidden items-center gap-8 xl:flex 2xl:gap-16">
        <BrandMark />
        <ul className="flex items-center gap-0 text-sm">
          {gameModes.map((mode) => {
            const active = mode.href === "/" ? pathname === "/" : pathname.startsWith(mode.href);
            const Icon = modeIcon[mode.id];
            return (
              <li key={mode.id} className="relative">
                <Link
                  href={mode.href}
                  className={cn(
                    "relative flex h-20 items-center gap-2 border-b-2 border-b-transparent px-3 text-sm font-semibold uppercase text-white/60 transition hover:opacity-80 2xl:px-6",
                    active && "border-b-white/10 text-white",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{mode.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="hidden xl:block">
        <AuthControls />
      </div>

      <div className="flex w-full min-w-0 items-center justify-between gap-3 xl:hidden">
        <BrandMark />
        <AuthControls />
      </div>
    </nav>
  );
}
