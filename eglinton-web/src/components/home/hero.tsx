"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { SiteContent } from "@/content/types";
import type { Tournament } from "@/domain/schemas";
import { DealTable } from "@/components/home/deal-table";
import { Magnetic, SplitReveal } from "@/components/motion/kinetic";
import { StatusBadge } from "@/components/tournaments/bits";
import { buyInTotal, formatChipsShort, formatDayMonth, formatEuro, formatTime, formatWeekdayShort } from "@/domain/format";
import { ease } from "@/lib/motion";

/** "Starts in 3h 12m" — computed in the browser from the scheduled start. */
function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  if (now == null) return null;
  const mins = Math.round((new Date(iso).getTime() - now) / 60_000);
  if (mins <= 0) return <span>Underway now</span>;
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return <span className="nums">Starts in {d ? `${d}d ` : ""}{h ? `${h}h ` : ""}{d ? "" : `${m}m`}</span>;
}

export function Hero({ hero, next, isDemo }: { hero: SiteContent["hero"]; next: Tournament | null; isDemo: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section ref={ref} className="surface-ink relative overflow-hidden border-b border-line" aria-labelledby="hero-title">
      <div className="grid grid-cols-1 lg:min-h-[calc(100svh-var(--header-h)-2rem)] lg:grid-cols-[1.2fr_1fr]">
        {/* Copy */}
        <motion.div style={{ y: reduce ? 0 : textY }} className="relative flex flex-col justify-center px-[var(--gutter)] pt-14 pb-14 lg:border-r lg:border-line lg:py-20">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: ease.expo, delay: 0.1 }}
            className="type-eyebrow flex items-center gap-3 text-detail"
          >
            <span aria-hidden className="h-[3px] w-7 bg-current" />
            {hero.eyebrow}
          </motion.p>
          <SplitReveal
            as="h1"
            id="hero-title"
            onView={false}
            delay={0.15}
            className="type-display-xl mt-7 text-[clamp(4.25rem,10.4vw,11.5rem)]"
            lines={[{ text: hero.headlineLead }, { text: hero.headlineEmphasis, outline: true }]}
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: ease.expo, delay: 0.75 }}
            className="type-lede mt-9 max-w-xl text-fg-muted"
          >
            {hero.lede}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: ease.expo, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <Link
                href="/schedule"
                className="group relative isolate inline-flex h-16 items-center gap-4 overflow-hidden bg-red-brand px-8 text-[0.9375rem] font-extrabold uppercase tracking-[0.1em] text-white before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-white before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-ink-950 hover:before:scale-y-100"
              >
                Tonight&rsquo;s games
                <ArrowUpRight aria-hidden className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.25} />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/visit"
                className="relative isolate inline-flex h-16 items-center overflow-hidden border border-fg px-8 text-[0.9375rem] font-extrabold uppercase tracking-[0.1em] text-fg before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-fg before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-ink-950 hover:before:scale-y-100"
              >
                Plan your visit
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* Media + next game */}
        <div className="relative flex flex-col">
          <motion.div
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.3, ease: ease.inOut, delay: 0.1 }}
            className="relative min-h-[24rem] flex-1 overflow-hidden"
          >
            {/* The deal: a full hand of hold'em. The venue photograph sits behind it once supplied. */}
            <DealTable image={hero.image} startDelay={1.1} />
          </motion.div>

          {next && (
            <Link href={`/tournaments/${next.id}`} className="group relative block">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1, ease: ease.expo, delay: 0.9 }}
                className="flex items-center justify-between gap-4 bg-fg px-[var(--gutter)] py-4 text-ink-950 lg:px-6"
              >
                <span className="min-w-0 truncate font-display text-[clamp(1.5rem,2.4vw,2.25rem)] uppercase leading-none">
                  Next · {next.name}
                </span>
                <span className="flex shrink-0 items-center gap-3 text-[0.6875rem] font-extrabold uppercase tracking-[0.1em]">
                  <span className="hidden sm:inline">
                    <Countdown iso={next.startsAt} />
                  </span>
                  <ArrowUpRight aria-hidden className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.25} />
                </span>
              </motion.div>
              <motion.dl
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 1.1 } } }}
                className="nums grid grid-cols-3 border-t border-line"
              >
                {[
                  ["Start", `${formatWeekdayShort(next.startsAt)} ${formatDayMonth(next.startsAt)}`, formatTime(next.startsAt), false],
                  ["Buy-in", `${formatChipsShort(next.startingStack)} stack`, formatEuro(buyInTotal(next.buyIn)), false],
                  ["Guarantee", isDemo ? "Demo data" : "Prize pool", next.guaranteeCents ? formatEuro(next.guaranteeCents) : "—", true],
                ].map(([label, sub, value, accent], i) => (
                  <motion.div
                    key={String(label)}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: ease.expo } } }}
                    className={`px-[var(--gutter)] py-5 lg:px-6 ${i > 0 ? "border-l border-line" : ""}`}
                  >
                    <dt className="text-[0.625rem] font-extrabold uppercase tracking-[0.14em] text-fg-faint">{label}</dt>
                    <dd className={`mt-2 font-display text-[clamp(2rem,3.4vw,3.25rem)] leading-none ${accent && next.guaranteeCents ? "text-accent-text" : ""}`}>{value}</dd>
                    <dd className="mt-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-fg-faint">{sub}</dd>
                  </motion.div>
                ))}
              </motion.dl>
              <div className="absolute right-[var(--gutter)] top-[-3.25rem] lg:right-6">
                <StatusBadge status={next.status} />
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
