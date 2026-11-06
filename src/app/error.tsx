"use client";

import { useEffect } from "react";
import { Button, ButtonLink, Eyebrow } from "@/components/ui/primitives";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="surface-ink py-28 md:py-40">
      <div className="container-site">
        <Eyebrow rule>Something went wrong</Eyebrow>
        <h1 className="type-display-l mt-8">This page didn&rsquo;t load properly.</h1>
        <p className="type-lede mt-6 max-w-lg text-fg-muted">Try again, or call the club on 091 569632.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button onClick={reset} arrow>
            Try again
          </Button>
          <ButtonLink href="/" variant="secondary">
            Home
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
