import { ButtonLink, Eyebrow } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <section className="surface-ink py-28 md:py-40">
      <div className="container-site">
        <Eyebrow rule>Page not found</Eyebrow>
        <h1 className="type-display-xl mt-8">
          That card
          <br />
          <em className="italic">isn&rsquo;t in the deck.</em>
        </h1>
        <p className="type-lede mt-6 max-w-lg text-fg-muted">
          The page may have moved, or the tournament may no longer be on the schedule.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/schedule" arrow>
            Tournament schedule
          </ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Home
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
