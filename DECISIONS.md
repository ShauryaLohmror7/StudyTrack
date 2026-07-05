# Decisions

Choices made on your behalf while building, per the spec's instruction to be opinionated and document it.

- **Tailwind v4 (CSS-first config).** Tokens live as CSS variables in `globals.css` with an `@theme inline` mapping — one source of truth, and the night theme is a pure CSS variable swap on `[data-theme="night"]`.
- **Hand-built SVG charts, no recharts.** The spec says charts must be themed, and asks before heavy deps. The score trend and the heatmap are small, bespoke SVG — lighter and fully on-token.
- **Fonts: Fraunces + Space Grotesk + JetBrains Mono**, all via `next/font` (self-hosted, no layout shift). Fraunces variable axes (`opsz`, `SOFT`, `WONK`) are loaded for the soft optical display voice.
- **`idb-keyval` over Dexie.** We persist one well-typed store snapshot, not relational queries; Dexie would be dead weight. The Zustand `persist` storage adapter in `lib/storage.ts` is the repository seam — a Supabase-backed adapter can replace it without touching feature code.
- **Streak is derived, not stored.** "Current focus streak" = consecutive calendar days with ≥1 logged session (surviving until midnight if today is still empty), computed from sessions. Stored counters drift; derivations can't.
- **GRA is `kind: "project"`.** Its detail page shows editable milestones instead of the lecture/homework/tutorial grid; its composite completion is milestone-based.
- **Weighted composite (exam courses):** weekly tracks 70% (lecture 30 / homework 20 / tutorial 20) + past papers 30%; `in_progress` counts half. If a subject has no past papers yet, weekly tracks count 100% rather than punishing an empty list.
- **Timer persists wall-clock `endsAt`,** not a tick count — reloading the page mid-session resumes correctly, and a session that ends while the tab is closed is reconciled on next load. Stopping a focus block early still logs the honest elapsed minutes (≥1 min).
- **Theme flash guard:** the persisted theme is mirrored to `localStorage("aura-theme")` and applied by a tiny inline script before first paint, because IndexedDB is async and would flash cream in night mode.
- **Aura mood is a separate tiny store** (`lib/aura-mood.ts`), so the background bloom never waits on IndexedDB hydration and anything can drive it without importing the whole data store.
- **Daily logs are rebuilt from sessions** on every session add/delete (keeping any saved reflection/mood), so totals can never disagree with the session list.
- **Model constant:** `claude-sonnet-5` in `lib/ai.ts` — swappable in one place.
