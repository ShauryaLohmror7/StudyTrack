"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useTransform, motion } from "motion/react";

/** Springy count-up number — animates on mount/in-view and on value change. */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toString(),
  className,
  style,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 22 });
  const text = useTransform(spring, (n) => format(n));

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  return (
    <motion.span ref={ref} className={`tabular ${className ?? ""}`} style={style}>
      {text}
    </motion.span>
  );
}
