"use client";

import { Coins, Gauge, Gem, LogIn, LogOut, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
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
      <div className="flex h-fit items-center gap-3">
        <Image
          src={brand.mark.src}
          alt=""
          width={brand.mark.width}
          height={brand.mark.height}
          unoptimized
          className="size-[30px]"
        />
        <div className="h-[30px] w-[2px] bg-white" />
        <span className="text-lg font-bold uppercase">{brand.name}</span>
      </div>
    </Link>
  );
}

function AuthControls() {
  const { user, openLogin, logout } = useAuth();

  return (
    <div className="flex items-center gap-3" suppressHydrationWarning>
      {user ? (
        <>
          <div className="flex items-center gap-2">
            <Image
              src={brand.mark.src}
              alt=""
              width={36}
              height={36}
              unoptimized
              className="size-9 rounded-full border-2 border-primary bg-card object-cover p-0.5"
            />
            <span className="hidden max-w-[9rem] truncate text-sm font-semibold sm:inline">{user.username}</span>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={logout} className="gap-1.5">
            <LogOut aria-hidden="true" />
            Logout
          </Button>
        </>
      ) : (
        <Button type="button" size="lg" onClick={openLogin} className="gap-2">
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
    <nav className="fixed z-40 flex h-20 w-full items-center justify-between border-b bg-nav px-8">
      <div className="hidden items-center gap-16 xl:flex">
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
                    "relative flex h-20 items-center gap-2 border-b-2 border-b-transparent px-6 text-sm font-semibold uppercase text-white/60 transition hover:opacity-80",
                    active && "border-b-white/10 text-white",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {mode.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="hidden xl:block">
        <AuthControls />
      </div>

      <div className="flex w-full items-center justify-between xl:hidden">
        <BrandMark />
        <AuthControls />
      </div>
    </nav>
  );
}
