"use client";
/* Segmented control: Individual vs Collaborative Crew mode. */
const MODES = [
  { id: "individual", label: "Individual", hint: "One specialist, one task" },
  { id: "crew", label: "Collaborative Crew", hint: "Agents pass state in sequence" },
];

export default function ModeToggle({ mode, onChange }) {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: "var(--s-1)",
        background: "var(--navy-900)",
        borderRadius: "var(--r-pill)",
        border: "1px solid var(--navy-600)",
      }}
    >
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            title={m.hint}
            style={{
              cursor: "pointer",
              border: "none",
              padding: "var(--s-2) var(--s-5)",
              borderRadius: "var(--r-pill)",
              fontWeight: 600,
              fontSize: "var(--fs-sm)",
              color: active ? "var(--navy-900)" : "var(--text-mid)",
              background: active ? "var(--grad-accent)" : "transparent",
              transition: "all var(--dur) var(--ease)",
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
