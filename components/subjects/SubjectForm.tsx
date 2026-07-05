"use client";

import { useState } from "react";
import { useAura } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { PillButton } from "@/components/ui/PillButton";
import { Field, TextInput, NumberInput, Select } from "@/components/ui/inputs";
import { AURA_HUE_VAR, type AuraHue, type Subject, type SubjectAurora, type SubjectKind } from "@/lib/types";
import { AURORAS } from "@/lib/aura-palettes";

const HUES: AuraHue[] = ["pink", "coral", "orange", "peach", "sage"];
const AURORA_CHOICES: SubjectAurora[] = ["lagoon", "polar", "meadow", "orchid", "glacier"];

export function SubjectForm({
  open,
  onClose,
  subject,
}: {
  open: boolean;
  onClose: () => void;
  subject?: Subject; // present = edit
}) {
  const addSubject = useAura((s) => s.addSubject);
  const updateSubject = useAura((s) => s.updateSubject);

  const [name, setName] = useState(subject?.name ?? "");
  const [code, setCode] = useState(subject?.code ?? "");
  const [professor, setProfessor] = useState(subject?.professor ?? "");
  const [kind, setKind] = useState<SubjectKind>(subject?.kind ?? "exam");
  const [color, setColor] = useState<AuraHue>(subject?.color ?? "pink");
  const [aurora, setAurora] = useState<SubjectAurora>(subject?.aurora ?? "lagoon");
  const [totalWeeks, setTotalWeeks] = useState(subject?.totalWeeks ?? 14);
  const [examDate, setExamDate] = useState(subject?.examDate?.slice(0, 10) ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    const patch = {
      name: name.trim(),
      code: code.trim(),
      professor: professor.trim() || undefined,
      kind,
      color,
      aurora,
      totalWeeks: Math.max(1, totalWeeks),
      examDate: examDate ? new Date(examDate).toISOString() : undefined,
    };
    if (subject) updateSubject(subject.id, patch);
    else addSubject(patch);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={subject ? `Edit ${subject.code}` : "New subject"}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <Field label="Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Diskrete Strukturen" required />
        </Field>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Code">
            <TextInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="DS" required />
          </Field>
          <Field label="Professor (optional)">
            <TextInput value={professor} onChange={(e) => setProfessor(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Type">
            <Select value={kind} onChange={(e) => setKind(e.target.value as SubjectKind)}>
              <option value="exam">Exam course</option>
              <option value="project">Project</option>
            </Select>
          </Field>
          <Field label={kind === "project" ? "Weeks (log columns)" : "Semester weeks"}>
            <NumberInput min={1} max={30} value={totalWeeks} onChange={(e) => setTotalWeeks(Number(e.target.value) || 14)} />
          </Field>
        </div>
        <Field label={kind === "project" ? "Deadline (optional)" : "Exam date (optional)"}>
          <TextInput type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </Field>

        <div>
          <span className="microlabel mb-2 block">Accent</span>
          <div className="flex gap-2.5" role="radiogroup" aria-label="Accent color">
            {HUES.map((h) => (
              <button
                key={h}
                type="button"
                role="radio"
                aria-checked={color === h}
                aria-label={h}
                onClick={() => setColor(h)}
                className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                style={{
                  background: AURA_HUE_VAR[h],
                  outline: color === h ? "2px solid var(--ink)" : "1px solid var(--line)",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <span className="microlabel mb-2 block">Page aurora</span>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Page aurora palette">
            {AURORA_CHOICES.map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={aurora === a}
                onClick={() => setAurora(a)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs capitalize transition-transform hover:scale-105"
                style={{
                  border: aurora === a ? "1.5px solid var(--ink)" : "1px solid var(--line)",
                  color: "var(--ink)",
                }}
              >
                <span
                  className="h-4 w-8 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${AURORAS[a][0]}, ${AURORAS[a][2]})`,
                  }}
                />
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <PillButton type="button" tone="ghost" onClick={onClose}>
            Cancel
          </PillButton>
          <PillButton type="submit" tone="solid">
            {subject ? "Save" : "Add subject"}
          </PillButton>
        </div>
      </form>
    </Modal>
  );
}
