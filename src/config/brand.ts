import type { CSSProperties } from "react";

/**
 * Client brand settings. Logo files live in /public/brand.
 * Theme tokens drive the chroma-inspired dark lobby look.
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
    radius: string;
    shadow: string;
    glow: string;
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
    width: 32,
    height: 32,
  },
  background: {
    image: null,
    position: "center",
    size: "cover",
  },
  theme: {
    background: "#0b0e16",
    foreground: "#f4f6fb",
    card: "#141824",
    cardForeground: "#f4f6fb",
    popover: "#1a1f2e",
    popoverForeground: "#f4f6fb",
    primary: "#5468f1",
    primaryForeground: "#ffffff",
    secondary: "#1e2436",
    secondaryForeground: "#d7ddf0",
    muted: "#1a2030",
    mutedForeground: "#97a0b8",
    accent: "#6d7dff",
    accentForeground: "#ffffff",
    destructive: "#ef5b6b",
    destructiveForeground: "#ffffff",
    border: "rgba(148, 163, 200, 0.16)",
    input: "rgba(148, 163, 200, 0.22)",
    ring: "#5468f1",
    radius: "0.75rem",
    shadow: "0 18px 40px rgba(0, 0, 0, 0.45)",
    glow: "0 0 0 1px rgba(84, 104, 241, 0.45), 0 0 28px rgba(84, 104, 241, 0.22)",
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
    "--radius": theme.radius,
    "--shadow": theme.shadow,
    "--glow": theme.glow,
    colorScheme: "dark",
  } as CSSProperties;
}
