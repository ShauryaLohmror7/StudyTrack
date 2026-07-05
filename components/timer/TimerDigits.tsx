"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * The outlined serif clock — transparent fill, ink stroke, like the reference.
 * Each digit rolls in with a soft vertical drift instead of a hard swap.
 */
export function TimerDigits({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const chars = text.split("");

  return (
    <div
      className="font-display text-outline flex select-none items-center justify-center leading-none"
      style={{
        fontSize: "clamp(5.5rem, 22vw, 15rem)",
        fontVariationSettings: "'opsz' 144, 'SOFT' 40",
        fontWeight: 400,
      }}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          className="relative inline-flex justify-center overflow-hidden"
          style={{ width: char === ":" ? "0.34em" : "0.6em", height: "1.06em" }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={char}
              initial={reduceMotion ? { opacity: 0 } : { y: "-45%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: "45%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="inline-block"
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </div>
  );
}
