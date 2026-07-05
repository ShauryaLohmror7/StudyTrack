/**
 * Aura palettes. The warm reference palette (pink→coral→orange→peach) belongs
 * to the timer and the home screen. Each subject page overrides the bloom
 * with its own cool aurora — bluish/greenish/turquoise families — so every
 * course has its own weather.
 *
 * Order matters: [core, mid, halo, wash] — core is the hot center of the
 * bloom, wash is the big soft outer field.
 */

export type AuroraName =
  | "warm"
  | "lagoon"
  | "polar"
  | "meadow"
  | "orchid"
  | "glacier"
  | "sage-break";

export const AURORAS: Record<AuroraName, [string, string, string, string]> = {
  // the reference: orange core, pink mid, coral halo, peach wash
  warm: ["var(--aura-orange)", "var(--aura-pink)", "var(--aura-coral)", "var(--aura-peach)"],
  // turquoise / teal / seafoam
  lagoon: ["#4ecdc4", "#2ba8a0", "#7fe0d4", "#b8efe6"],
  // deep blue / periwinkle / ice
  polar: ["#6c8cff", "#4a63d9", "#93b4ff", "#c4d5ff"],
  // green / mint / spring
  meadow: ["#63c46f", "#3d9e56", "#96dfa0", "#c9f0cb"],
  // violet / lilac / blue
  orchid: ["#a678e8", "#7d54c9", "#c39cf2", "#dcc8f7"],
  // cyan / seafoam / pale sky
  glacier: ["#5bc8e8", "#3aa3cc", "#8eddf0", "#c6eef7"],
  // break state: sage cooling
  "sage-break": ["var(--sage)", "var(--sage-deep)", "var(--aura-peach)", "var(--sage)"],
};

/** Cool palettes assigned to subjects (never "warm" — that's the timer's). */
export const SUBJECT_AURORAS: Exclude<AuroraName, "warm" | "sage-break">[] = [
  "lagoon",
  "polar",
  "meadow",
  "orchid",
  "glacier",
];
