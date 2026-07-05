"use client";

import { motion } from "motion/react";

/** Editorial section heading: micro-kicker + italic serif line that draws its rule in view. */
export function SectionHeading({
  kicker,
  children,
  right,
}: {
  kicker?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 mt-14 first:mt-0"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          {kicker && <p className="microlabel mb-1.5">{kicker}</p>}
          <h2
            className="font-display text-2xl italic sm:text-3xl"
            style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 80" }}
          >
            {children}
          </h2>
        </div>
        {right && <div className="pb-1">{right}</div>}
      </div>
      <motion.div
        className="rule mt-3"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  );
}
