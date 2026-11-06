import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Marquee, Magnetic, SplitReveal } from "@/components/motion/kinetic";

/**
 * The closing call to action used at the bottom of every promotional page.
 * Deliberately NOT used on responsible-gaming or policy pages.
 */
export function InviteBand({
  title = [{ text: "Your seat" }, { text: "is waiting.", outline: true }],
  lede = "Membership is €20 a year and open to the public. Call in with photo ID and your address to join, then pull up a chair.",
  phoneHref,
  phoneDisplay,
}: {
  title?: { text: string; outline?: boolean }[];
  lede?: string;
  phoneHref: string;
  phoneDisplay: string;
}) {
  return (
    <section className="surface-red relative overflow-hidden" aria-label="Visit The Eglinton">
      <Marquee label="Eglinton Street, Galway" className="border-b border-line py-3" baseVelocity={-1.4}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="flex items-center font-display text-[1.25rem] uppercase tracking-[0.02em]">
            <span className="px-6">Hold&rsquo;em</span>
            <span aria-hidden>●</span>
            <span className="px-6">Omaha</span>
            <span aria-hidden>●</span>
            <span className="px-6">Blackjack</span>
            <span aria-hidden>●</span>
            <span className="px-6">Roulette</span>
            <span aria-hidden>●</span>
            <span className="px-6">Eglinton Street, Galway</span>
            <span aria-hidden>●</span>
          </span>
        ))}
      </Marquee>
      <div className="container-site grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-8">
          <SplitReveal as="h2" lines={title} className="type-display-xl" />
          <p className="type-lede mt-8 max-w-xl text-fg-muted">{lede}</p>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-4 lg:items-end">
          <Magnetic>
            <Link
              href="/schedule"
              className="group inline-flex h-16 items-center gap-4 bg-ink-950 px-8 text-[0.9375rem] font-extrabold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white hover:text-ink-950"
            >
              See what&rsquo;s on
              <ArrowUpRight aria-hidden className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.25} />
            </Link>
          </Magnetic>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.875rem] font-bold uppercase tracking-[0.08em]">
            <Link href="/visit" className="link-rule pb-1">
              Plan your visit
            </Link>
            <a href={phoneHref} className="nums link-rule pb-1">
              Call {phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
