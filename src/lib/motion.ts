/**
 * Motion language — "Scoreboard".
 * Fast in, long soft settle (expo-out). Short travel. No bounce.
 * Everything here is mirrored in globals.css for CSS transitions.
 */
import type { Transition, Variants } from "motion/react";

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  expo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.4,
  slow: 0.8,
  reveal: 1.0,
};

export const transition = {
  base: { duration: duration.base, ease: ease.out } satisfies Transition,
  fast: { duration: duration.fast, ease: ease.out } satisfies Transition,
  slow: { duration: duration.slow, ease: ease.expo } satisfies Transition,
  /** Layout shifts (sorting, indicators). Critically damped — no overshoot. */
  layout: { type: "spring", stiffness: 480, damping: 44, mass: 1 } satisfies Transition,
  /** Magnetic / pointer-following elements. */
  magnetic: { type: "spring", stiffness: 260, damping: 18, mass: 0.5 } satisfies Transition,
};

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.expo } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.slow, ease: ease.out } },
};

export const stagger = (step = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});
