"use client";

import { motion } from "motion/react";
import type { PastPaper } from "@/lib/types";

/** Hand-built SVG score trend across completed past papers. */
export function ScoreTrend({ papers, color }: { papers: PastPaper[]; color: string }) {
  const scored = papers
    .filter((p) => p.scorePercent != null)
    .sort((a, b) => (a.completedAt ?? "").localeCompare(b.completedAt ?? ""));

  if (scored.length < 2) return null;

  const w = 280;
  const h = 90;
  const pad = 12;
  const xs = (i: number) => pad + (i * (w - pad * 2)) / (scored.length - 1);
  const ys = (v: number) => h - pad - ((v / 100) * (h - pad * 2));
  const points = scored.map((p, i) => [xs(i), ys(p.scorePercent!)] as const);
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

  return (
    <figure aria-label="Past paper score trend" className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-xs overflow-visible">
        {[0, 50, 100].map((g) => (
          <g key={g}>
            <line x1={pad} x2={w - pad} y1={ys(g)} y2={ys(g)} stroke="var(--line)" strokeWidth="1" />
            <text x={0} y={ys(g) + 3} fontSize="7" fill="var(--ink-faint)" fontFamily="var(--font-mono)">
              {g}
            </text>
          </g>
        ))}
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        {points.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="3.2"
            fill="var(--paper)"
            stroke={color}
            strokeWidth="2"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 * i + 0.3, type: "spring", stiffness: 400, damping: 18 }}
          />
        ))}
      </svg>
      <figcaption className="microlabel mt-1">score trend</figcaption>
    </figure>
  );
}
