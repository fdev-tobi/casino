import type { CSSProperties } from "react";

/**
 * Adopt Luck = chroma.gg layout fork.
 * Same surfaces/radii/structure; primary is Adopt Luck blue instead of mint.
 */
export type BrandConfig = {
  name: string;
  tagline: string;
  description: string;
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
    showWordmark: boolean;
  };
  mark: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  background: {
    image: string | null;
    position: string;
    size: string;
  };
  theme: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    nav: string;
    chat: string;
    radius: string;
  };
};

export const brand: BrandConfig = {
  name: "Adopt Luck",
  tagline: "Demo lobby for CoinFlip, JackPot, Upgrader, Race, and Leaderboard.",
  description:
    "Adopt Luck is a presentation prototype of a branded item-game lobby. Modes, values, and chat use mock data. It does not offer wagering, payments, or verified valuations.",
  logo: {
    src: "/brand/wordmark-transparent.png",
    alt: "Adopt Luck",
    width: 168,
    height: 29,
    showWordmark: false,
  },
  mark: {
    src: "/brand/mark-transparent.png",
    alt: "Adopt Luck crossed swords",
    width: 30,
    height: 30,
  },
  background: {
    image: null,
    position: "center",
    size: "cover",
  },
  theme: {
    // chroma.gg surface hex equivalents; primary swapped to Adopt Luck blue
    background: "#191b24",
    foreground: "#ffffff",
    card: "#1e2029",
    cardForeground: "#ffffff",
    popover: "#171921",
    popoverForeground: "#ffffff",
    primary: "#5468f1",
    primaryForeground: "#ffffff",
    secondary: "#2f3141",
    secondaryForeground: "#ffffff",
    muted: "#2f3141",
    mutedForeground: "#b3b3b3",
    accent: "#242632",
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#22242f",
    input: "#1c1e27",
    ring: "#5468f1",
    nav: "#1e2029",
    chat: "#171921",
    radius: "0.5rem",
  },
};

export function brandStyle(): CSSProperties {
  const theme = brand.theme;
  return {
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--card": theme.card,
    "--card-foreground": theme.cardForeground,
    "--popover": theme.popover,
    "--popover-foreground": theme.popoverForeground,
    "--primary": theme.primary,
    "--primary-foreground": theme.primaryForeground,
    "--secondary": theme.secondary,
    "--secondary-foreground": theme.secondaryForeground,
    "--muted": theme.muted,
    "--muted-foreground": theme.mutedForeground,
    "--accent": theme.accent,
    "--accent-foreground": theme.accentForeground,
    "--destructive": theme.destructive,
    "--destructive-foreground": theme.destructiveForeground,
    "--border": theme.border,
    "--input": theme.input,
    "--ring": theme.ring,
    "--nav": theme.nav,
    "--chat": theme.chat,
    "--radius": theme.radius,
    colorScheme: "dark",
  } as CSSProperties;
}
