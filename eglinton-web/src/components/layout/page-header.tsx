import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/primitives";
import { SplitReveal, type RevealLine } from "@/components/motion/kinetic";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  lede,
  aside,
  crumbs,
  className,
  size = "xl",
}: {
  eyebrow?: React.ReactNode;
  /** Lines of the display title; `outline: true` sets a line in outline type. */
  title: RevealLine[];
  lede?: React.ReactNode;
  aside?: React.ReactNode;
  crumbs?: { href: string; label: string }[];
  className?: string;
  size?: "xl" | "l";
}) {
  return (
    <header className={cn("surface-ink border-b border-line pt-10 pb-12 md:pt-16 md:pb-16", className)}>
      <div className="container-site">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-fg-faint">
              {crumbs.map((c, i) => (
                <li key={c.href} className="inline-flex items-center gap-1.5">
                  {i > 0 && <ChevronRight aria-hidden className="size-3" />}
                  <Link href={c.href} className="hover:text-fg">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-9">
            {eyebrow && (
              <Reveal>
                <Eyebrow rule className="mb-6">
                  {eyebrow}
                </Eyebrow>
              </Reveal>
            )}
            <SplitReveal as="h1" lines={title} onView={false} delay={0.05} className={size === "xl" ? "type-display-xl" : "type-display-l"} />
            {lede && (
              <Reveal delay={0.35}>
                <div className="type-lede mt-8 max-w-2xl text-fg-muted">{lede}</div>
              </Reveal>
            )}
          </div>
          {aside && <div className="lg:col-span-3 lg:justify-self-end">{aside}</div>}
        </div>
      </div>
    </header>
  );
}
