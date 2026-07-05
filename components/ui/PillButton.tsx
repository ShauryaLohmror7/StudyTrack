"use client";

import { motion } from "motion/react";
import type { ComponentProps } from "react";

/**
 * The app's one button voice: an outlined pill with a quiet spring.
 * `tone="solid"` fills with ink for the single primary action on a screen.
 */
type Props = ComponentProps<typeof motion.button> & {
  tone?: "outline" | "solid" | "ghost";
  size?: "sm" | "md" | "lg";
  active?: boolean;
};

export function PillButton({
  tone = "outline",
  size = "md",
  active = false,
  className = "",
  children,
  style,
  ...rest
}: Props) {
  const sizes = {
    sm: "px-3 py-1 text-[0.6875rem]",
    md: "px-5 py-2 text-xs",
    lg: "px-8 py-3 text-sm",
  } as const;

  const toneStyle: React.CSSProperties =
    tone === "solid" || active
      ? { background: "var(--ink)", color: "var(--paper)", border: "1px solid var(--ink)" }
      : tone === "ghost"
        ? { background: "transparent", color: "var(--ink-soft)", border: "1px solid transparent" }
        : { background: "transparent", color: "var(--ink)", border: "1px solid var(--line-strong)" };

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={`inline-flex items-center gap-2 rounded-full font-sans uppercase tracking-[0.16em] ${sizes[size]} ${className}`}
      style={{ ...toneStyle, ...(style as React.CSSProperties) }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
