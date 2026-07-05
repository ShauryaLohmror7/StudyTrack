"use client";

import { motion, useReducedMotion } from "motion/react";
import { useAuraMood, type AuraMood } from "@/lib/aura-mood";

/**
 * The signature element: a soft aurora bloom of layered radial gradients,
 * heavily blurred, drifting very slowly. Color responds to timer state —
 * calm multi-hue when idle, warmer and gently pulsing in focus,
 * cooling toward sage during a break.
 *
 * Under prefers-reduced-motion the drift freezes but the color remains.
 */

type Layer = {
  color: string;
  x: string;
  y: string;
  size: string;
  driftX: number[];
  driftY: number[];
  scale: number[];
  duration: number;
};

const LAYERS: Record<AuraMood, Layer[]> = {
  idle: [
    { color: "var(--aura-pink)", x: "38%", y: "40%", size: "44rem", driftX: [0, 40, -25, 0], driftY: [0, -30, 20, 0], scale: [1, 1.06, 0.97, 1], duration: 26 },
    { color: "var(--aura-coral)", x: "55%", y: "48%", size: "38rem", driftX: [0, -35, 30, 0], driftY: [0, 25, -20, 0], scale: [1, 0.95, 1.08, 1], duration: 31 },
    { color: "var(--aura-orange)", x: "48%", y: "58%", size: "30rem", driftX: [0, 25, -30, 0], driftY: [0, -20, 25, 0], scale: [1, 1.1, 0.94, 1], duration: 23 },
    { color: "var(--aura-peach)", x: "46%", y: "44%", size: "52rem", driftX: [0, -20, 15, 0], driftY: [0, 15, -15, 0], scale: [1, 1.04, 0.98, 1], duration: 37 },
  ],
  focus: [
    { color: "var(--aura-coral)", x: "42%", y: "42%", size: "48rem", driftX: [0, 25, -15, 0], driftY: [0, -18, 12, 0], scale: [1, 1.09, 0.96, 1], duration: 11 },
    { color: "var(--aura-orange)", x: "52%", y: "52%", size: "42rem", driftX: [0, -20, 18, 0], driftY: [0, 15, -12, 0], scale: [1, 0.94, 1.1, 1], duration: 13 },
    { color: "var(--aura-pink)", x: "48%", y: "38%", size: "34rem", driftX: [0, 15, -18, 0], driftY: [0, -12, 15, 0], scale: [1, 1.12, 0.95, 1], duration: 9 },
    { color: "var(--aura-orange)", x: "46%", y: "50%", size: "58rem", driftX: [0, -12, 10, 0], driftY: [0, 10, -10, 0], scale: [1, 1.05, 0.98, 1], duration: 15 },
  ],
  break: [
    { color: "var(--sage)", x: "42%", y: "44%", size: "46rem", driftX: [0, 30, -20, 0], driftY: [0, -22, 16, 0], scale: [1, 1.05, 0.97, 1], duration: 29 },
    { color: "var(--aura-peach)", x: "54%", y: "50%", size: "38rem", driftX: [0, -25, 20, 0], driftY: [0, 18, -15, 0], scale: [1, 0.96, 1.06, 1], duration: 33 },
    { color: "var(--sage)", x: "48%", y: "56%", size: "32rem", driftX: [0, 18, -22, 0], driftY: [0, -15, 18, 0], scale: [1, 1.08, 0.95, 1], duration: 25 },
    { color: "var(--aura-pink)", x: "46%", y: "40%", size: "50rem", driftX: [0, -15, 12, 0], driftY: [0, 12, -12, 0], scale: [1, 1.03, 0.99, 1], duration: 39 },
  ],
};

// Focus mode adds a slow whole-bloom pulse on top of the drift.
const PULSE: Record<AuraMood, { scale: number[]; duration: number }> = {
  idle: { scale: [1], duration: 1 },
  focus: { scale: [1, 1.045, 1], duration: 4.2 },
  break: { scale: [1], duration: 1 },
};

export function AuraBloom() {
  const mood = useAuraMood((s) => s.mood);
  const reduceMotion = useReducedMotion();
  const pulse = PULSE[mood];

  return (
    <div aria-hidden className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? { scale: 1 } : { scale: pulse.scale }}
        transition={{ duration: pulse.duration, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "blur(70px) saturate(1.05)", opacity: "var(--aura-opacity)" }}
      >
        {LAYERS[mood].map((l, i) => (
          <motion.div
            key={`${mood}-${i}`}
            className="absolute rounded-full"
            initial={{ opacity: 0 }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, x: l.driftX, y: l.driftY, scale: l.scale }
            }
            transition={{
              opacity: { duration: 2.2, ease: "easeOut" },
              x: { duration: l.duration, repeat: Infinity, ease: "easeInOut" },
              y: { duration: l.duration, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: l.duration, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              left: l.x,
              top: l.y,
              width: l.size,
              height: l.size,
              marginLeft: `calc(${l.size} / -2)`,
              marginTop: `calc(${l.size} / -2)`,
              background: `radial-gradient(circle, ${l.color} 0%, transparent 62%)`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
