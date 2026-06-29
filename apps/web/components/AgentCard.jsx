"use client";
/* Reusable agent tile. Selectable in both Individual and Crew mode. */
export default function AgentCard({ agent, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(agent.id)}
      style={{
        textAlign: "left",
        cursor: "pointer",
        padding: "var(--s-4)",
        borderRadius: "var(--r-md)",
        background: selected ? "var(--navy-700)" : "var(--navy-800)",
        border: `1px solid ${selected ? "var(--blue-400)" : "var(--navy-600)"}`,
        boxShadow: selected ? "var(--shadow-glow)" : "var(--shadow-card)",
        transition: "all var(--dur) var(--ease)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--s-2)",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, color: "var(--text-hi)" }}>{agent.role}</span>
        <span
          style={{
            fontSize: "var(--fs-xs)",
            fontFamily: "var(--font-mono)",
            color: "var(--blue-300)",
            background: "var(--navy-900)",
            padding: "2px 8px",
            borderRadius: "var(--r-pill)",
          }}
        >
          {agent.model}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--text-mid)", lineHeight: 1.5 }}>
        {agent.goal?.slice(0, 110)}…
      </p>
    </button>
  );
}
