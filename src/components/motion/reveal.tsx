"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { ease, fadeRise, stagger } from "@/lib/motion";

/** Reveal a block once as it enters the viewport. */
export function Reveal({ children, delay = 0, className, ...rest }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: ease.expo, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({ children, className, step = 0.06 }: { children: React.ReactNode; className?: string; step?: number }) {
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -8% 0px" }} variants={stagger(step)}>
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" }) {
  const C = as === "li" ? motion.li : motion.div;
  return (
    <C className={className} variants={fadeRise}>
      {children}
    </C>
  );
}
