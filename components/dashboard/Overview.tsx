"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { format } from "date-fns";
import { useAura } from "@/lib/store";
import {
  subjectCompletion,
  minutesOnDay,
  dayStreak,
  daysUntil,
  formatMinutes,
  outstandingWork,
} from "@/lib/derive";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PillButton } from "@/components/ui/PillButton";
import { SubjectForm } from "@/components/subjects/SubjectForm";
import { AURA_HUE_VAR } from "@/lib/types";
import { AURORAS } from "@/lib/aura-palettes";

const cardSpring = { type: "spring", stiffness: 260, damping: 24 } as const;

export function Overview() {
  const subjectsAll = useAura((s) => s.subjects);
  const sessions = useAura((s) => s.sessions);
  const updateSubject = useAura((s) => s.updateSubject);
  const [addOpen, setAddOpen] = useState(false);

  const subjects = useMemo(() => subjectsAll.filter((s) => !s.archived), [subjectsAll]);
  const todayMin = useMemo(
    () => minutesOnDay(sessions, format(new Date(), "yyyy-MM-dd")),
    [sessions]
  );
  const streak = useMemo(() => dayStreak(sessions), [sessions]);

  // local, no-API read of the day: per-subject minutes + top priorities
  const todaySessions = useMemo(
    () => sessions.filter((s) => format(new Date(s.startedAt), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")),
    [sessions]
  );
  const todayBySubject = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of todaySessions) map.set(s.subjectId, (map.get(s.subjectId) ?? 0) + s.durationMinutes);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [todaySessions]);
  const priorities = useMemo(() => {
    // top 3, but spread across subjects so ties don't show one course thrice
    const all = outstandingWork(subjects);
    const picked: typeof all = [];
    for (const item of all) {
      if (picked.length >= 3) break;
      if (picked.some((p) => p.subjectId === item.subjectId)) continue;
      picked.push(item);
    }
    for (const item of all) {
      if (picked.length >= 3) break;
      if (!picked.includes(item)) picked.push(item);
    }
    return picked;
  }, [subjects]);
  const focusBlocks = todaySessions.filter((s) => s.source === "timer").length;

  const nextExam = useMemo(() => {
    const dated = subjects
      .filter((s) => s.examDate && daysUntil(s.examDate) >= 0)
      .sort((a, b) => daysUntil(a.examDate!) - daysUntil(b.examDate!));
    return dated[0] ?? null;
  }, [subjects]);

  const stats = [
    {
      label: "logged today",
      value: todayMin,
      render: (
        <span className="font-mono">
          <AnimatedNumber value={Math.floor(todayMin / 60)} /> h{" "}
          <AnimatedNumber value={todayMin % 60} /> m
        </span>
      ),
    },
    {
      label: "day streak",
      value: streak,
      render: (
        <span className="font-mono">
          <AnimatedNumber value={streak} />{" "}
          <span className="text-base" style={{ color: "var(--ink-soft)" }}>
            {streak === 1 ? "day" : "days"}
          </span>
        </span>
      ),
    },
    {
      label: nextExam ? `next: ${nextExam.code}` : "next exam",
      value: nextExam ? daysUntil(nextExam.examDate!) : null,
      render: nextExam ? (
        <span className="font-mono">
          <AnimatedNumber value={daysUntil(nextExam.examDate!)} />{" "}
          <span className="text-base" style={{ color: "var(--ink-soft)" }}>
            days
          </span>
        </span>
      ) : (
        <span className="font-display text-2xl italic" style={{ color: "var(--ink-faint)" }}>
          none set
        </span>
      ),
    },
  ];

  return (
    <div className="mt-16 sm:mt-24">
      {/* stat strip */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl sm:grid-cols-3"
        style={{ border: "1px solid var(--line)", background: "var(--line)" }}
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0, transition: cardSpring },
            }}
            className="flex flex-col gap-2 px-7 py-6"
            style={{ background: "color-mix(in srgb, var(--paper-raised) 82%, transparent)" }}
          >
            <span className="microlabel">{s.label}</span>
            <span className="text-4xl sm:text-5xl">{s.render}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* today, read locally — no API needed */}
      <SectionHeading
        kicker={`${todaySessions.length} session${todaySessions.length === 1 ? "" : "s"} · ${focusBlocks} focus block${focusBlocks === 1 ? "" : "s"}`}
      >
        Today so far
      </SectionHeading>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {todayBySubject.length === 0 ? (
            <p className="font-display italic" style={{ color: "var(--ink-faint)" }}>
              Nothing logged yet today — one focus block changes that.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {todayBySubject.map(([sid, min]) => {
                const subj = subjects.find((x) => x.id === sid);
                if (!subj) return null;
                return (
                  <li key={sid} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 font-mono text-xs">{subj.code}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: AURA_HUE_VAR[subj.color] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${todayMin ? (min / todayMin) * 100 : 0}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono text-xs tabular" style={{ color: "var(--ink-soft)" }}>
                      {formatMinutes(min)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <p className="microlabel mb-3">up next, weighted by exam proximity</p>
          {priorities.length === 0 ? (
            <p className="font-display italic" style={{ color: "var(--ink-faint)" }}>
              Everything is ticked off. Suspicious.
            </p>
          ) : (
            <ol className="flex flex-col gap-2">
              {priorities.map((p, i) => (
                <motion.li
                  key={`${p.subjectId}-${p.description}`}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-baseline gap-3 text-sm"
                >
                  <span className="font-display text-lg italic" style={{ color: "var(--ink-faint)" }}>
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-mono text-xs">{p.subjectCode}</span>{" "}
                    <span style={{ color: "var(--ink-soft)" }}>{p.description}</span>
                  </span>
                </motion.li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* exams — inline editable, feeds countdowns + analysis weighting */}
      <SectionHeading kicker="dates drive the priorities">Exams</SectionHeading>
      <ul className="grid gap-2 sm:grid-cols-2">
        {subjects.map((subj) => {
          const d = subj.examDate ? daysUntil(subj.examDate) : null;
          return (
            <li
              key={subj.id}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ border: "1px solid var(--line)", background: "color-mix(in srgb, var(--paper-raised) 75%, transparent)" }}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: AURA_HUE_VAR[subj.color] }} />
              <span className="w-14 font-mono text-xs">{subj.code}</span>
              <span className="microlabel flex-1">{subj.kind === "project" ? "deadline" : "exam"}</span>
              <input
                type="date"
                value={subj.examDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  updateSubject(subj.id, {
                    examDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  })
                }
                aria-label={`${subj.code} ${subj.kind === "project" ? "deadline" : "exam"} date`}
                className="bg-transparent font-mono text-xs outline-none"
                style={{ borderBottom: "1px solid var(--line-strong)", color: "var(--ink)" }}
              />
              <span
                className="w-14 text-right font-mono text-xs tabular"
                style={{ color: d != null && d >= 0 && d <= 14 ? AURA_HUE_VAR[subj.color] : "var(--ink-soft)" }}
              >
                {d == null ? "—" : d < 0 ? "done" : `${d}d`}
              </span>
            </li>
          );
        })}
      </ul>

      {/* subjects */}
      <SectionHeading
        kicker="this semester"
        right={
          <PillButton size="sm" onClick={() => setAddOpen(true)}>
            + Add subject
          </PillButton>
        }
      >
        Subjects
      </SectionHeading>

      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {subjects.map((subj) => {
          const completion = subjectCompletion(subj);
          const total = sessions
            .filter((x) => x.subjectId === subj.id)
            .reduce((a, x) => a + x.durationMinutes, 0);
          const days = subj.examDate ? daysUntil(subj.examDate) : null;
          const [c0, , c2] = AURORAS[subj.aurora] ?? AURORAS.lagoon;
          return (
            <motion.li
              key={subj.id}
              variants={{
                hidden: { opacity: 0, y: 28, scale: 0.97 },
                show: { opacity: 1, y: 0, scale: 1, transition: cardSpring },
              }}
              whileHover={{ y: -5 }}
            >
              <Link
                href={`/subjects/${subj.id}`}
                className="group relative block overflow-hidden rounded-3xl p-6"
                style={{
                  border: "1px solid var(--line)",
                  background: "color-mix(in srgb, var(--paper-raised) 80%, transparent)",
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                {/* the subject's aurora seeps in from the corner on hover */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-75"
                  style={{ background: `radial-gradient(circle, ${c0}, ${c2} 60%, transparent 75%)` }}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-display text-3xl"
                        style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 50" }}
                      >
                        {subj.code}
                      </span>
                      {subj.kind === "project" && (
                        <span className="microlabel rounded-full px-2 py-0.5" style={{ border: "1px solid var(--line-strong)" }}>
                          project
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs" style={{ color: "var(--ink-soft)" }}>
                      {subj.name}
                    </p>
                    <p className="mt-3 font-mono text-xs" style={{ color: "var(--ink-soft)" }}>
                      {formatMinutes(total)} logged
                      {days != null && days >= 0 && (
                        <> · <span style={{ color: days <= 14 ? AURA_HUE_VAR[subj.color] : undefined }}>{days}d left</span></>
                      )}
                    </p>
                  </div>
                  <ProgressRing value={completion} color={AURA_HUE_VAR[subj.color]} size={62}>
                    <span className="font-mono text-[0.65rem] tabular">
                      {Math.round(completion * 100)}%
                    </span>
                  </ProgressRing>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>

      <SubjectForm open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
