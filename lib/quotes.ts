/**
 * Original quotes tuned to exam-season reality — no poster lines.
 * Rolled after each completed focus block.
 */
const QUOTES = [
  "One reviewed week beats three skimmed ones.",
  "The exam doesn't ask how you felt about the lecture. It asks the lecture.",
  "You don't need to feel ready. You need reps.",
  "Past papers are the syllabus telling you its secrets.",
  "Confusion at minute one is the tuition for clarity at minute forty.",
  "Nobody remembers the semester. Everybody remembers the week they stopped avoiding the hard subject.",
  "A 25-minute block you finished outranks the 4-hour plan you didn't.",
  "The tutorial sheet you're dreading is the exact shape of the exam.",
  "Streaks are built on the days you didn't feel like it.",
  "Reading the solution is watching someone else swim.",
  "Your future self is grading your calendar, not your intentions.",
  "Slow on paper today, fast in the exam hall later.",
  "The panic in July is just the June you skipped, forwarded.",
  "Done and imperfect closes a week. Perfect and pending closes nothing.",
  "Every proof you redo by hand is one the exam can't ambush you with.",
  "Breaks are part of the work. Guilt during breaks is not.",
] as const;

export function rollQuote(exclude?: string): string {
  const pool = QUOTES.filter((q) => q !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? QUOTES[0];
}
