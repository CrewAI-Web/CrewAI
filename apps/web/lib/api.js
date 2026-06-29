/* Thin client for the FastAPI bridge (apps/api/main.py). */
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  listAgents: () => fetch(`${BASE}/agents`).then((r) => r.json()),
  runIndividual: (agent_id, task, expected_output) =>
    post("/run/individual", { agent_id, task, expected_output }),
  runCrew: (topic) => post("/run/crew", { topic }),
};
