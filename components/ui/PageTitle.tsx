"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Giant editorial page title: an outlined serif word (like the clock) with
 * an italic filled flourish word, letters rising in with a stagger.
 */
export function PageTitle({
  outline,
  italic,
  kicker,
}: {
  outline: string;
  italic?: string;
  kicker?: string;
}) {
  const reduceMotion = useReducedMotion();
  const letters = outline.split("");

  return (
    <header className="mb-8 sm:mb-12">
      {kicker && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="microlabel mb-2"
        >
          {kicker}
        </motion.p>
      )}
      <h1
        className="font-display leading-[0.95]"
        style={{ fontSize: "clamp(3rem, 9vw, 6.5rem)" }}
      >
        <span className="text-outline inline-block" aria-label={outline}>
          {letters.map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "0.35em", rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                delay: 0.04 * i,
                type: "spring",
                stiffness: 240,
                damping: 24,
              }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </span>
        {italic && (
          <motion.em
            className="ml-3 inline-block italic sm:ml-5"
            style={{
              fontVariationSettings: "'opsz' 100, 'SOFT' 90",
              fontSize: "0.6em",
              color: "var(--ink)",
            }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * letters.length + 0.1, duration: 0.6 }}
          >
            {italic}
          </motion.em>
        )}
      </h1>
      <motion.div
        className="rule mt-5"
        initial={reduceMotion ? { opacity: 0 } : { scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left", borderColor: "var(--line-strong)" }}
      />
    </header>
  );
}
