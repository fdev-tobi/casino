import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/lobby/app-shell";
import { brand, brandStyle } from "@/config/brand";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | Demo lobby`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  icons: { icon: brand.mark.src },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" style={brandStyle()}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
