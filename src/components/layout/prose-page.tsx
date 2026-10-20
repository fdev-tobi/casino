import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";

export function ProsePage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-12">
      <p className="text-xs tracking-[0.18em] uppercase text-accent">{eyebrow}</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
      <div className="mt-8 max-w-2xl space-y-4 text-sm leading-7 text-muted-foreground">{children}</div>
    </Container>
  );
}
