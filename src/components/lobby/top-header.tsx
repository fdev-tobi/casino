"use client";

import { LogIn } from "lucide-react";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { Button } from "@/components/ui/button";

export function TopHeader({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#0d111c]/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <BrandLockup />
        <Button type="button" onClick={onLogin} className="gap-2">
          <LogIn aria-hidden="true" />
          Login
        </Button>
      </div>
    </header>
  );
}
