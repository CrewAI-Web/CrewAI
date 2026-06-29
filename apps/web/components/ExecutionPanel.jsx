"use client";
import { useState } from "react";
import { api } from "../lib/api";

/* Right-hand console: prompt input, Run CTA, and streamed/returned output. */
export default function ExecutionPanel({ mode, selectedIds }) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setOutput("Running…");
    try {
      const res =
        mode === "individual"
          ? await api.runIndividual(selectedIds[0], prompt)
          : await api.runCrew(prompt);
      setOutput(res.output || res.stdout || JSON.stringify(res, null, 2));
    } catch (e) {
      setOutput(`⚠️ ${e.message}\n\nIs the API running on :8000?`);
    } finally {
      setBusy(false);
    }
  }

  const disabled =
    busy || !prompt || (mode === "individual" && selectedIds.length !== 1);

  return (
    <section
      style={{
        background: "var(--navy-800)",
        border: "1px solid var(--navy-600)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--s-4)",
        height: "100%",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "var(--fs-lg)" }}>
        {mode === "individual" ? "Run a Specialist" : "Orchestrate the Crew"}
      </h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={
          mode === "individual"
            ? "Describe the task for the selected agent…"
            : "Describe the project to build (fills {topic})…"
        }
        rows={5}
        style={{
          resize: "vertical",
          background: "var(--navy-900)",
          color: "var(--text-hi)",
          border: "1px solid var(--navy-600)",
          borderRadius: "var(--r-md)",
          padding: "var(--s-4)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--fs-md)",
        }}
      />

      <button
        onClick={run}
        disabled={disabled}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          border: "none",
          padding: "var(--s-4)",
          borderRadius: "var(--r-pill)",
          fontWeight: 700,
          fontSize: "var(--fs-md)",
          color: "white",
          background: "var(--grad-cta)",
          boxShadow: "0 8px 30px var(--pink-glow)",
          transition: "transform var(--dur) var(--ease)",
        }}
      >
        {busy ? "Working…" : mode === "individual" ? "▸ Execute Task" : "▸ Launch Crew"}
      </button>

      <pre
        style={{
          flex: 1,
          margin: 0,
          overflow: "auto",
          background: "var(--navy-900)",
          border: "1px solid var(--navy-600)",
          borderRadius: "var(--r-md)",
          padding: "var(--s-4)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-sm)",
          color: "var(--text-mid)",
          whiteSpace: "pre-wrap",
          minHeight: 160,
        }}
      >
        {output || "Output will appear here."}
      </pre>
    </section>
  );
}
