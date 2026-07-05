"use client";

/** Shared editorial form controls — hairline underlined fields, no boxes. */

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="microlabel mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  border: "none",
  borderBottom: "1px solid var(--line-strong)",
  background: "transparent",
  color: "var(--ink)",
  borderRadius: 0,
};

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-0 py-2 font-sans text-sm outline-none transition-colors focus:border-b-2 ${props.className ?? ""}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      {...props}
      className={`w-full px-0 py-2 font-mono text-sm outline-none transition-colors focus:border-b-2 ${props.className ?? ""}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full cursor-pointer px-0 py-2 font-sans text-sm outline-none ${props.className ?? ""}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none px-0 py-2 font-sans text-sm outline-none transition-colors focus:border-b-2 ${props.className ?? ""}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}
