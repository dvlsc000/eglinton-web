"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { Image as ContentImage } from "@/content/types";
import { ease } from "@/lib/motion";

export type TowerEvent = {
  id: string;
  /** Short event name, e.g. "Main Event". */
  name: string;
  /** e.g. "Sat 5 Dec". */
  day: string;
  guaranteeCents: number | null;
  /** Formatted guarantee, e.g. "€15,000". */
  guaranteeLabel: string;
};

type Tone = "paper" | "ink" | "red";

/** A round chip value that keeps the tallest tower at or under `maxChips`. */
function chipValue(maxCents: number, maxChips = 30) {
  const steps = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000];
  return steps.find((s) => maxCents / s <= maxChips) ?? steps[steps.length - 1];
}

/** Deterministic jitter so the stacks look hand-placed but render the same on server and client. */
/** Fall height, relative to a chip's own height so it scales with the panel. */
const DROP = "-1100%";

const jitter = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return (v - Math.floor(v) - 0.5) * 2; // -1 … 1
};

/**
 * The series guarantee, stacked. One tower per event, one chip per unit of
 * guarantee. Chips drop in tower by tower, Thursday to Sunday, when the panel
 * scrolls into view. Sizes come from the panel (container units in
 * globals.css, `.tw-*`), so the towers fit any width.
 */
export function ChipTowers({ events, image }: { events: TowerEvent[]; image?: ContentImage }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduce = useReducedMotion();

  const maxCents = Math.max(1, ...events.map((e) => e.guaranteeCents ?? 0));
  const unit = chipValue(maxCents);
  const counts = events.map((e) => Math.round((e.guaranteeCents ?? 0) / unit));
  const maxCount = Math.max(1, ...counts);
  const mainIndex = counts.indexOf(maxCount);
  const unitLabel = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(unit / 100);

  // Timing: towers build in order, each in roughly the same time whatever its height.
  const towerGap = 0.55;
  const starts: number[] = [];
  const steps: number[] = [];
  let t = 0.15;
  counts.forEach((n) => {
    starts.push(t);
    const step = Math.min(0.06, 0.75 / Math.max(n, 1));
    steps.push(step);
    t += Math.max(n, 1) * step + towerGap;
  });
  const fall = 0.42;

  const play = inView || !!reduce;

  return (
    <div
      ref={ref}
      className="tw-stage"
      style={{ ["--n" as string]: events.length, ["--max" as string]: maxCount } as React.CSSProperties}
    >
      {image?.src && <Image src={image.src} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover opacity-15" />}

      <p className="tw-legend">
        <span aria-hidden className="tw-legend-chip" />1 chip = {unitLabel} guaranteed
      </p>

      <ol className="tw-row" aria-label="Guarantee by event">
        {events.map((ev, i) => {
          const n = counts[i];
          const tone: Tone = i === mainIndex ? "red" : i % 2 === 0 ? "paper" : "ink";
          const done = starts[i] + Math.max(n - 1, 0) * steps[i] + fall;
          return (
            <li key={ev.id} className="tw-col" style={{ ["--count" as string]: n } as React.CSSProperties}>
              <Link href={`/tournaments/${ev.id}`} className="tw-tower" aria-label={`${ev.name}, ${ev.day}: ${ev.guaranteeLabel} guaranteed`}>
                {/* contact shadow, darkens as the stack grows */}
                <motion.span
                  aria-hidden
                  className="tw-shadow"
                  initial={{ opacity: 0, scaleX: 0.6 }}
                  animate={play ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.6 }}
                  transition={{ duration: 0.6, ease: ease.out, delay: reduce ? 0 : starts[i] }}
                />
                {Array.from({ length: n }, (_, k) => (
                  <motion.span
                    key={k}
                    aria-hidden
                    data-tone={tone}
                    className="tw-chip"
                    style={{ ["--k" as string]: k, ["--jx" as string]: `${(jitter(i, k) * 1.6).toFixed(2)}px` } as React.CSSProperties}
                    initial={{ opacity: 0, y: DROP }}
                    animate={play ? { opacity: 1, y: [DROP, "0%", "-10%", "0%"] } : { opacity: 0, y: DROP }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : {
                            // Per-value transitions don't inherit a shared delay, so each carries its own.
                            y: { delay: starts[i] + k * steps[i], duration: fall, times: [0, 0.72, 0.86, 1], ease: ["easeIn", "easeOut", "easeIn"] },
                            opacity: { delay: starts[i] + k * steps[i], duration: 0.08 },
                          }
                    }
                  >
                    <span className="tw-side" />
                    <span className="tw-top" />
                  </motion.span>
                ))}
                <motion.span
                  aria-hidden
                  className="tw-amount nums"
                  data-main={i === mainIndex || undefined}
                  initial={{ opacity: 0, y: 8 }}
                  animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={{ duration: 0.5, ease: ease.expo, delay: reduce ? 0 : done }}
                >
                  {ev.guaranteeLabel}
                </motion.span>
                <span aria-hidden className="tw-label">
                  <span className="tw-day nums">{ev.day}</span>
                  <span className="tw-name">{ev.name}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
