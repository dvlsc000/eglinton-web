"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { cn } from "@/lib/cn";
import { ease, transition } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* SplitReveal — words rise out of masks, line by line                        */
/* -------------------------------------------------------------------------- */

export type RevealLine = { text: string; outline?: boolean; accent?: boolean };

export function SplitReveal({
  lines,
  as: Tag = "h2",
  className,
  delay = 0,
  onView = true,
  id,
}: {
  lines: RevealLine[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  /** Animate when scrolled into view (true) or immediately on mount (false). */
  onView?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const play = onView ? inView : true;
  let i = 0;
  return (
    <Tag ref={ref} id={id} className={className} aria-label={lines.map((l) => l.text).join(" ")}>
      {lines.map((line, li) => (
        <span key={li} aria-hidden className="block">
          {line.text.split(" ").map((word, wi) => {
            const d = delay + i++ * 0.055;
            return (
              <span key={wi} className="inline-block overflow-hidden pb-[0.06em] align-top">
                <motion.span
                  className={cn(
                    "inline-block will-change-transform",
                    line.outline && "text-transparent [-webkit-text-stroke:clamp(1px,0.12vw,2px)_var(--fg)]",
                    line.accent && "text-accent-text"
                  )}
                  initial={{ y: "105%" }}
                  animate={play ? { y: "0%" } : { y: "105%" }}
                  transition={{ duration: 1, ease: ease.expo, delay: d }}
                >
                  {word}
                  {wi < line.text.split(" ").length - 1 ? " " : ""}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* Marquee — continuous ticker that speeds up with scroll velocity           */
/* -------------------------------------------------------------------------- */

export function Marquee({
  children,
  baseVelocity = -2.2,
  className,
  label,
}: {
  children: React.ReactNode;
  baseVelocity?: number;
  className?: string;
  label: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const direction = useRef(1);
  const [paused, setPaused] = useState(false);
  const pos = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || paused) return;
    let move = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * Math.abs(f);
    x.set(x.get() + move);
  });

  return (
    <div
      className={cn("relative flex overflow-hidden whitespace-nowrap", className)}
      role="marquee"
      aria-label={label}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <motion.div className="flex shrink-0 flex-nowrap" style={{ x: reduce ? 0 : pos }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Magnetic — element leans toward the pointer                               */
/* -------------------------------------------------------------------------- */

export function Magnetic({ children, strength = 0.28, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, transition.magnetic);
  const y = useSpring(0, transition.magnetic);
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength * 1.3);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* CountUp — numbers roll up when they come into view                        */
/* -------------------------------------------------------------------------- */

const fmt = {
  integer: new Intl.NumberFormat("en-IE"),
  euro: new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
  hours: new Intl.NumberFormat("en-IE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  plain: { format: (n: number) => String(Math.round(n)) },
};

export function CountUp({
  value,
  format = "integer",
  /** For euro values: the number passed is cents. */
  cents = false,
  duration = 1.6,
  className,
  pad = 0,
}: {
  value: number;
  format?: keyof typeof fmt;
  cents?: boolean;
  duration?: number;
  className?: string;
  pad?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const reduce = useReducedMotion();
  const target = cents ? value / 100 : value;
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => {
    const n = format === "hours" ? v : Math.round(v);
    const s = fmt[format].format(n);
    return pad ? s.padStart(pad, "0") : s;
  });
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(target);
      return;
    }
    const c = animate(mv, target, { duration, ease: ease.expo });
    return c.stop;
  }, [inView, target, duration, reduce, mv]);
  return (
    <span ref={ref} className={cn("nums", className)}>
      <span className="sr-only">{fmt[format].format(target)}</span>
      <motion.span aria-hidden>{text}</motion.span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* GrowBar — horizontal bar that fills to a ratio when in view               */
/* -------------------------------------------------------------------------- */

export function GrowBar({ ratio, className, barClassName, delay = 0 }: { ratio: number; className?: string; barClassName?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} aria-hidden className={cn("relative h-1.5 bg-fg/10", className)}>
      <motion.div
        className={cn("absolute inset-0 origin-left bg-fg", barClassName)}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: inView ? Math.max(0, Math.min(1, ratio)) : 0 }}
        transition={{ duration: 1.4, ease: ease.expo, delay }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Parallax — content drifts against the scroll                              */
/* -------------------------------------------------------------------------- */

export function Parallax({ children, offset = 80, className }: { children: React.ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div className="absolute -inset-y-[var(--px)] inset-x-0" style={{ y: reduce ? 0 : y, ["--px" as string]: `${offset}px` }}>
        {children}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ScrollProgress — thin red reading-progress line                           */
/* -------------------------------------------------------------------------- */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-red-brand" style={{ scaleX }} />;
}

/* -------------------------------------------------------------------------- */
/* Drift — big type that slides sideways as the section scrolls past         */
/* -------------------------------------------------------------------------- */

export function Drift({ children, distance = 120, className }: { children: React.ReactNode; distance?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ x: reduce ? 0 : x }}>{children}</motion.div>
    </div>
  );
}
