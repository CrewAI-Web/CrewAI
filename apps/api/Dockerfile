# ---- FastAPI bridge (build context = repo root) ----
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy

# uv (fast Python package manager)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Install deps first for better layer caching
COPY pyproject.toml uv.lock* ./
RUN uv sync --no-dev

# App source
COPY agents ./agents
COPY tools ./tools
COPY knowledge ./knowledge
COPY skills ./skills
COPY crew.jsonc ./crew.jsonc
COPY apps/api ./apps/api

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
