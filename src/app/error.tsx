"use client";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-20">
      <h1 className="text-4xl">This page didn&apos;t load</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        The demonstration floor hit an unexpected error. You can try the page again.
      </p>
      <Button type="button" className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </Container>
  );
}
