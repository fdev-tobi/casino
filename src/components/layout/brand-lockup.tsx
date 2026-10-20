import Image from "next/image";
import Link from "next/link";

import { brand } from "@/config/brand";

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link href="/" aria-label={brand.name} className="inline-flex min-h-11 items-center gap-2">
        <Image
          src={brand.mark.src}
          alt=""
          width={brand.mark.width}
          height={brand.mark.height}
          unoptimized
          className="drop-shadow-[0_0_12px_rgba(84,104,241,0.55)]"
        />
        <span className="text-sm font-bold tracking-[0.08em] uppercase">{brand.name}</span>
      </Link>
    );
  }

  return (
    <Link href="/" aria-label={brand.name} className="inline-flex min-h-11 items-center gap-2">
      <Image
        src={brand.logo.src}
        alt={brand.logo.alt}
        width={brand.logo.width}
        height={brand.logo.height}
        unoptimized
        className="h-7 w-auto drop-shadow-[0_0_14px_rgba(84,104,241,0.45)] sm:h-8"
        priority
      />
      {brand.logo.showWordmark ? (
        <span className="text-sm font-bold tracking-[0.08em] uppercase">{brand.name}</span>
      ) : null}
    </Link>
  );
}
