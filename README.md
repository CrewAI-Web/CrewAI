# crewai_claude_v1

A full-stack AI delivery ecosystem built on **crewAI** (JSON-first configuration) with a
premium web dashboard for orchestrating the crew.

## Architecture

```
crewai_claude_v1/
├── agents/                 # 11 specialist agents (JSONC) — the "brains"
├── tools/                  # Custom tools (GitHub + LinkedIn, official APIs only)
├── crew.jsonc              # Crew definition: agents, tasks, sequential pipeline
├── knowledge/  skills/     # Shared knowledge + reusable skills
├── apps/
│   ├── api/                # FastAPI bridge (exposes the crew to the dashboard)
│   └── web/                # Next.js dashboard (Individual + Collaborative modes)
│       ├── styles/tokens.css   # Design-token system (the palette lives here)
│       ├── components/         # Reusable UI: AgentCard, ModeToggle, ExecutionPanel
│       ├── lib/api.js          # Client for the FastAPI bridge
│       └── app/                # App Router pages
├── .env.example            # Every credential + where to get it
└── pyproject.toml
```

## Quick start

```bash
# 1. Python deps + secrets
cp .env.example .env          # then fill in the keys you need
uv sync

# 2. Backend bridge  (terminal A)
uv run uvicorn apps.api.main:app --reload --port 8000

# 3. Web dashboard   (terminal B)
cd apps/web && npm install && npm run dev      # http://localhost:3000

# Or run the crew headless, no UI:
uv run crewai run
```

## Execution modes
- **Individual** — pick one specialist, give it a task.
- **Collaborative Crew** — agents run in sequence, each passing state to the next.

## Security posture
- GitHub & LinkedIn tools use **official APIs only** (no scraping/unofficial endpoints).
- LinkedIn publishing is **human-in-the-loop**: drafts are returned for approval; nothing
  posts until `approve=True`.
- Releases are created as **drafts** by default.
- Secrets live only in `.env` (gitignored).
