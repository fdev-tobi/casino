"use client";

import { Coins, Gauge, LogIn, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { gameModes } from "@/config/navigation";
import { cn } from "@/lib/utils";

const modeIcon: Record<(typeof gameModes)[number]["id"], ComponentType<SVGProps<SVGSVGElement>>> = {
  coinflip: Coins,
  jackpot: Gauge,
  upgrader: Zap,
  race: Trophy,
  leaderboard: Trophy,
};

export function TopHeader({ onLogin }: { onLogin: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="fixed z-40 flex h-20 w-full items-center justify-between border-b bg-nav px-8">
      {/* Desktop: logo + mode links */}
      <div className="hidden items-center gap-16 xl:flex">
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

      {/* Desktop login */}
      <div className="hidden xl:block">
        <Button type="button" size="lg" onClick={onLogin} className="gap-2">
          <LogIn aria-hidden="true" />
          Login
        </Button>
      </div>

      {/* Mobile header */}
      <div className="flex w-full items-center justify-between xl:hidden">
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
        <Button type="button" size="lg" onClick={onLogin} className="gap-2">
          <LogIn aria-hidden="true" />
          Login
        </Button>
      </div>
    </nav>
  );
}
