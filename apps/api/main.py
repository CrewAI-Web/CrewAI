"""
FastAPI bridge between the web dashboard and the crewAI project.

Run from the project root:
    uv run uvicorn apps.api.main:app --reload --port 8000

Endpoints
    GET  /agents              -> list agents (role + model) parsed from agents/*.jsonc
    POST /run/individual      -> run ONE agent on a single task (Individual Mode)
    POST /run/crew            -> run the full sequential crew (Collaborative Mode)
"""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parents[2]   # crewai_claude_v1/
AGENTS_DIR = ROOT / "agents"

app = FastAPI(title="crewai_claude_v1 API", version="1.0.0")

# Allow the local dashboard (Next.js dev server) to call us.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _strip_jsonc(text: str) -> str:
    """Remove // line comments and /* */ blocks so we can json.loads a .jsonc file."""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    text = re.sub(r"(^|\s)//.*$", "", text, flags=re.MULTILINE)
    return text


def _load_agent(path: Path) -> dict:
    cfg = json.loads(_strip_jsonc(path.read_text(encoding="utf-8")))
    return {
        "id": path.stem,
        "role": cfg.get("role", path.stem),
        "goal": cfg.get("goal", ""),
        "model": cfg.get("llm") if isinstance(cfg.get("llm"), str) else "custom-endpoint",
        "tools": cfg.get("tools", []),
    }


@app.get("/agents")
def list_agents():
    return sorted((_load_agent(p) for p in AGENTS_DIR.glob("*.jsonc")), key=lambda a: a["role"])


class IndividualRequest(BaseModel):
    agent_id: str          # filename stem, e.g. "backend_engineer"
    task: str              # what the user wants this agent to do
    expected_output: str = "A complete, well-structured result."


@app.post("/run/individual")
def run_individual(req: IndividualRequest):
    """Build a one-agent crew from the agent's .jsonc config and run it."""
    from crewai import Agent, Crew, Task, Process

    cfg = json.loads(_strip_jsonc((AGENTS_DIR / f"{req.agent_id}.jsonc").read_text("utf-8")))
    agent = Agent(
        role=cfg["role"],
        goal=cfg["goal"],
        backstory=cfg.get("backstory", ""),
        llm=cfg.get("llm"),
        verbose=True,
        allow_delegation=False,
    )
    task = Task(description=req.task, expected_output=req.expected_output, agent=agent)
    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential)
    result = crew.kickoff()
    return {"agent": cfg["role"], "model": cfg.get("llm"), "output": str(result)}


class CrewRequest(BaseModel):
    topic: str             # fills the {topic} placeholder in crew.jsonc


@app.post("/run/crew")
def run_crew(req: CrewRequest):
    """Run the full declarative crew via the crewai CLI (respects crew.jsonc)."""
    proc = subprocess.run(
        ["crewai", "run"],
        cwd=ROOT,
        input=f"{req.topic}\n",
        capture_output=True,
        text=True,
        timeout=1800,
    )
    return {"ok": proc.returncode == 0, "stdout": proc.stdout[-8000:], "stderr": proc.stderr[-2000:]}
