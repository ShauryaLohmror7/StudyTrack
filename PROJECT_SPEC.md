# Aura — Personal Study Platform

**A prompt/spec for Claude Code.** Read this whole file before writing any code. Ask me clarifying questions if a decision is genuinely ambiguous; otherwise make a strong opinionated choice and note it in a `DECISIONS.md`.

---

## 0. What we're building

A personal, single-user study platform for a TUM Informatik student tracking multiple courses at once. It has to do three things extremely well:

1. **Track deep, per-subject progress** across the structure of a real semester — week-by-week lecture review, homework review, tutorial-exercise review, and past-paper practice — not just a single "% done" bar.
2. **Run a focus timer** ("Aura Timer") that logs real study time (hours + minutes) against a specific subject and category, with focus/break cycles.
3. **Reflect** — generate an end-of-day analysis of how studying actually went, using the Anthropic API.

This starts as a personal tool but must be built so new subjects/semesters slot in cleanly. It should eventually be public on GitHub as a portfolio piece, so code quality and commit hygiene matter.

**Primary user:** me, on desktop mostly, but it must be fully responsive and genuinely usable on mobile (I study on the go).

---

## 1. Non-negotiables

- **This must NOT look like AI-generated UI.** No default shadcn card grids on a slate background, no generic gradient hero, no emoji-as-icons. The visual identity is specific and editorial (see §3). If a screen you build could belong to any generic SaaS dashboard, redo it.
- **TypeScript everywhere.** Strict mode on. No `any` unless truly unavoidable and commented.
- **Accessible baseline:** keyboard focus visible, `prefers-reduced-motion` respected (the aura animations must calm down, not stop the app working), semantic HTML, labelled controls.
- **Local-first.** The app must fully work offline with no account. Data persists on-device. (Cloud sync is an optional later milestone, see §7.)
- **Git from commit 1.** `git init` immediately. Commit at every milestone in §9 with clean messages. Add a proper `.gitignore` (Node) so `.env.local`, `node_modules`, build output are never committed.

---

## 2. Tech stack

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Animation:** `motion` (Framer Motion) — used deliberately, not sprinkled. Layout animations for the weekly grids, number transitions on the timer, page/route transitions, spring micro-interactions on toggles.
- **State + persistence:** Zustand with a `persist` middleware backed by **IndexedDB** (via `idb-keyval` or Dexie) rather than `localStorage`, because we'll store a lot of session history and daily logs. Keep the store well-typed and split into slices (subjects, sessions, timer, dailyLogs, settings).
- **Components:** you may pull polished, distinctive components from **21st.dev** (the component registry) as *starting points* — animated counters, bento layouts, fancy inputs, magnetic buttons, etc. — but every one must be re-themed to our design tokens (§3). Never paste a component in with its default styling. Credit any borrowed component in a comment.
- **Icons:** `lucide-react`, but sparingly. Prefer typographic and drawn elements over icon-soup.
- **Charts:** lightweight — `recharts` or hand-built SVG. Charts must also be themed, not default-colored.
- **AI:** Anthropic API via the official `@anthropic-ai/sdk`, called from a Next.js **route handler** (server-side) so the key never ships to the client. Key in `.env.local` as `ANTHROPIC_API_KEY`. Use a current Claude model string; make the model a single config constant so it's swappable.
- **Dates:** `date-fns`. Store timestamps as ISO strings.

---

## 3. Design direction — "Aura"

The reference image is the north star: a **warm cream paper background with visible film grain**, a soft **aurora bloom** in the center that gradients through **pink → coral → warm orange → peach**, huge **outline-only serif** timer digits (stroke, transparent fill), a thin pill **progress bar** up top, and a small **vertical serif label** ("aura timer") on the side. It feels analog, editorial, and calm — like a risograph print, not a dashboard.

Build a real token system in `globals.css` / Tailwind config and derive everything from it:

**Palette (name them as CSS variables):**
- `--paper`: warm off-white cream, ~`#F2EDE4` (the base background)
- `--ink`: near-black warm charcoal, ~`#1A1712` (text, outline strokes)
- `--aura-pink`: ~`#E9A0C4`
- `--aura-coral`: ~`#F19E8E`
- `--aura-orange`: ~`#F4A94C`
- `--aura-peach`: ~`#F6D2A9`
- one cool accent for "done/success" states so the warm palette isn't monotonous — a muted teal/sage, ~`#7FA99B`
- Support a **dark "night" variant** too (deep warm brown-black paper, the aura glowing brighter against it) toggleable in settings.

**Type:**
- **Display / timer:** a high-contrast characterful serif — **Fraunces** (variable, use its optical + soft settings) or a Didone like Playfair. The timer digits use `-webkit-text-stroke` with `color: transparent` for the outline effect, exactly like the reference. This face also does big section headings.
- **UI / body:** a clean, slightly technical sans — **Geist** or **Space Grotesk** — for labels, data, buttons.
- **Data / time readouts:** a mono — **JetBrains Mono** or **Geist Mono** — for logged hours, timestamps, week numbers.
- Set an intentional type scale. The contrast between the big soft serif and the tight technical sans/mono *is* the personality.

**Texture & atmosphere:**
- A grain overlay across the whole app via SVG `feTurbulence` (subtle, ~4–6% opacity), fixed so it doesn't scroll.
- The aura bloom is layered radial gradients with heavy blur, drifting *very* slowly. Its color should **respond to state**: calm multi-hue when idle, warmer/more saturated and pulsing gently during a focus session, cooling toward the sage accent during a break. Under `prefers-reduced-motion`, freeze the drift but keep the color.

**Motion language:**
- Timer digits transition with a subtle roll/fade, not a jarring swap.
- Ticking a week's task off animates: the cell fills, a soft spring, the progress ring for that subject advances with a `layout` transition.
- Route/screen changes cross-fade with a slight vertical drift.
- Buttons: magnetic / spring hover, but quiet. One signature interaction done well beats ten scattered effects.

**Signature element:** the aura bloom that breathes with your focus state, paired with the outlined serif clock, is the thing the app is remembered by. Everything else stays disciplined and quiet around it.

---

## 4. Data model

Type everything. Rough shape (adapt as needed, document in code):

```ts
type Category = 'lecture' | 'homework' | 'tutorial'; // per-week reviewable tracks
type Status = 'todo' | 'in_progress' | 'done';

interface WeekProgress {
  week: number;                 // 1..totalWeeks
  lecture: Status;
  homework: Status;
  tutorial: Status;
  note?: string;                // optional per-week note
}

interface PastPaper {
  id: string;
  label: string;                // e.g. "WS22/23 Endterm", "Retake 2021"
  status: Status;
  scorePercent?: number;        // optional, after doing it
  note?: string;
}

interface FocusTopic {
  id: string;
  text: string;                 // "prove AVL rotations", "weakest precondition"
  done: boolean;
}

interface Subject {
  id: string;
  name: string;                 // "Funktionale Programmierung & Verifikation"
  code: string;                 // "FPV"
  color: string;                // one of the aura hues
  professor?: string;
  totalWeeks: number;           // e.g. 14
  examDate?: string;            // ISO — powers a countdown
  weeks: WeekProgress[];
  pastPapers: PastPaper[];
  focusTopics: FocusTopic[];
  archived?: boolean;
}

interface StudySession {
  id: string;
  subjectId: string;
  category?: Category | 'past_paper' | 'general';
  weekRef?: number;             // which week this session was about, optional
  startedAt: string;            // ISO
  durationMinutes: number;      // real logged time
  source: 'timer' | 'manual';   // from the Aura Timer or hand-entered
  note?: string;
}

interface DailyLog {
  date: string;                 // YYYY-MM-DD
  totalMinutes: number;
  subjectsTouched: string[];    // subjectIds
  sessionIds: string[];
  aiReflection?: string;        // generated end-of-day analysis
  mood?: 1 | 2 | 3 | 4 | 5;     // optional self-rating
}
```

Seed the store with my five current subjects: **FPV**, **EIST**, **GAD**, **LinAlg** (all exams), and **GRA** (a project, not an exam — mark it distinctly, e.g. `type: 'project'` on the subject, and let its "weeks" track project milestones instead of lecture/homework/tutorial). Let me edit all of this in the UI; don't hardcode beyond the seed.

---

## 5. Screens & features

**A. Dashboard (home)**
- The Aura Timer as the hero (see §6), matching the reference image.
- A compact overview: today's logged time, current focus streak, per-subject progress rings, nearest exam countdown.
- "Add subject" and quick-jump to any subject.

**B. Subject detail** (click a subject)
- Header: name, code, color, professor, exam/deadline countdown.
- **Weekly grid:** rows = Lecture / Homework / Tutorial, columns = weeks 1..N, each cell a 3-state toggle (todo → in_progress → done) that animates. This is the "tick done with week 2 of 14" mechanic. Show per-track completion (e.g. "Lecture review: 8/14").
- **Past papers:** add papers, mark status, optionally log a score; show a small trend of scores over time.
- **Focus topics:** free-text list of things to prioritise ("go deeper on modular arithmetic"), checkable.
- **Time on this subject:** total logged, breakdown by category, recent sessions list, and a "log time manually" entry (hours + minutes).
- A per-subject overall completion that's a *weighted composite* of weekly tracks + past papers, not an arbitrary slider.

**C. Log / history**
- Chronological list of all study sessions, filterable by subject/category/date.
- Manual session entry (subject, category, week, duration in h/m, note).

**D. Daily reflection**
- End-of-day analysis generated by the AI feature (§8): how long I studied, how many subjects I touched, what got done vs. what's still outstanding (pull from unchecked weeks weighted by exam proximity), and 2–3 concrete suggestions for tomorrow. Save it into the `DailyLog`.
- A simple calendar/heatmap of study minutes per day over the semester.

**E. Settings**
- Timer preset durations, day/night theme toggle, motivational-quote toggle, export/import data as JSON (so I never lose my history and can move machines).

---

## 6. The Aura Timer (match the reference)

- Outlined serif digits (`MM:SS`), transparent fill + ink stroke, exactly like the image.
- Thin pill progress bar across the top showing session completion `%`.
- The vertical serif "aura timer" label element.
- Presets (editable): Sprint 15/3, Focus 25/5, Deep Aura 50/10 (focus/break minutes). Custom durations allowed.
- **Before starting a focus block, pick the subject** (and optionally category + week) so the logged time lands in the right place.
- Focus → auto-transition to break with a cooler aura → back to idle (or auto-repeat if I enable it).
- On focus completion: write a `StudySession`, advance streak, roll a fresh motivational quote (original, tuned to exam-season reality — not generic poster lines).
- Pause / resume / stop / skip-break controls.
- The aura's color and pulse are driven by timer state (§3).

---

## 7. Persistence

- Zustand + IndexedDB, fully offline.
- **JSON export/import** is required (Settings) — this is the safety net.
- **Optional later milestone:** Supabase sync for cross-device (I have Supabase experience). Design the store so a sync layer can be added without rewriting features — keep persistence behind a thin repository interface.

---

## 8. AI end-of-day analysis

- Route handler at `app/api/reflect/route.ts`, server-side, using `@anthropic-ai/sdk` and `ANTHROPIC_API_KEY` from `.env.local`. **Never expose the key client-side.**
- Input: today's sessions, subjects touched, total time, and outstanding work (unchecked weeks/past-papers weighted by exam proximity).
- Output: a warm, specific, honest reflection — what went well, what slipped, and a short prioritised plan for tomorrow. No empty hype.
- Model as a single swappable config constant. Handle errors gracefully (show a friendly fallback if the key is missing or the call fails — the rest of the app must keep working).
- Add a `.env.example` documenting `ANTHROPIC_API_KEY=` so setup is obvious. Never commit the real key.

---

## 9. Build milestones (commit at each)

1. **Scaffold** — Next.js + TS + Tailwind, design tokens in place, fonts loaded, grain + aura background component working, `.gitignore`, README skeleton. *Commit: "chore: scaffold + design system".*
2. **Data layer** — types, Zustand slices, IndexedDB persistence, seed data, JSON export/import. *Commit.*
3. **Aura Timer** — full timer matching the reference, logging sessions, streak, quotes. *Commit.*
4. **Subject detail** — weekly grid, past papers, focus topics, per-subject time + manual logging. *Commit.*
5. **Dashboard** — overview, progress rings, countdowns, quick actions. *Commit.*
6. **Log/history + calendar heatmap.** *Commit.*
7. **AI reflection** — route handler + daily reflection screen. *Commit.*
8. **Polish pass** — motion refinement, responsive/mobile, accessibility, reduced-motion, night theme, self-critique against §1 and §3. *Commit.*
9. *(Optional)* Supabase sync.

At the end, write a real `README.md`: what it is, screenshots, stack, how to run (`.env` setup included), and a short "design notes" section — this is a portfolio piece.

---

## 10. Working style

- Keep `DECISIONS.md` for choices you make on my behalf.
- After each visual milestone, screenshot and critique your own work: does it look like the reference, or like generic AI UI? Fix before moving on.
- Prefer a few strong, distinctive moves over lots of features that all look default.
- Ask me before adding heavy dependencies.
