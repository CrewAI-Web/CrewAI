"use client";
import { useEffect, useState } from "react";
import AgentCard from "../components/AgentCard";
import ModeToggle from "../components/ModeToggle";
import ExecutionPanel from "../components/ExecutionPanel";
import { api } from "../lib/api";

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [mode, setMode] = useState("individual");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    api.listAgents().then(setAgents).catch(() => setAgents([]));
  }, []);

  function toggle(id) {
    if (mode === "individual") {
      setSelected([id]);                       // single-select
    } else {
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "var(--s-6)", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--s-6)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", letterSpacing: "-0.02em" }}>
            crew<span style={{ color: "var(--pink-400)" }}>ai</span>{" "}
            <span style={{ color: "var(--blue-400)" }}>Control Center</span>
          </h1>
          <p style={{ margin: "var(--s-2) 0 0", color: "var(--text-lo)" }}>
            Orchestrate your full-stack AI crew — individually or in collaboration.
          </p>
        </div>
        <ModeToggle mode={mode} onChange={(m) => { setMode(m); setSelected([]); }} />
      </header>

      {/* Two-column workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--s-6)", alignItems: "start" }}>
        {/* Agent roster */}
        <section>
          <h2 style={{ fontSize: "var(--fs-lg)", margin: "0 0 var(--s-4)" }}>
            {mode === "individual" ? "Select one specialist" : "Compose your crew"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--s-4)" }}>
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} selected={selected.includes(a.id)} onToggle={toggle} />
            ))}
            {agents.length === 0 && (
              <p style={{ color: "var(--text-lo)" }}>
                No agents loaded. Start the API: <code>uv run uvicorn apps.api.main:app --port 8000</code>
              </p>
            )}
          </div>
        </section>

        {/* Execution console */}
        <ExecutionPanel mode={mode} selectedIds={selected} />
      </div>
    </main>
  );
}
