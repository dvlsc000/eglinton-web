"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";

// The very first render (a full page load) gets no curtain; only navigations do.
let hasNavigated = false;

/**
 * Page transition: a red curtain lifts off the new page while the content
 * settles upward. Purely visual — the page is already rendered underneath,
 * so navigation is never slowed down.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const curtain = hasNavigated && !reduce;
  useEffect(() => {
    hasNavigated = true;
  }, []);
  return (
    <>
      {curtain && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[65] origin-top bg-red-brand"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.75, ease: ease.inOut }}
        />
      )}
      <motion.div
        initial={curtain ? { opacity: 0, y: 40 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.expo, delay: 0.25 }}
      >
        {children}
      </motion.div>
    </>
  );
}
