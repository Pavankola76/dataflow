# Developer Setup Guide

## Prerequisites

- Docker Desktop (latest)
- Node.js 20+ with pnpm
- Python 3.12+ with pip
- Git

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/dataflow-ai.git
cd dataflow-ai

# 2. Start infrastructure services
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# 3. Install frontend dependencies
cd apps/web && pnpm install

# 4. Install backend dependencies
cd ../api && pip install -e ".[dev]"

# 5. Run database migrations
alembic upgrade head

# 6. (Optional) Seed sample data
python scripts/seed.py
```

## Running Services

Open four terminal windows:

| Terminal | Command | Port |
|----------|---------|------|
| Frontend | `cd apps/web && pnpm dev` | 3000 |
| Backend API | `cd apps/api && uvicorn main:app --reload` | 8000 |
| Celery Worker | `cd apps/api && celery -A workers worker -l info` | — |
| AI Agents | `cd packages/ai-agents && python orchestrator.py` | 8001 |

## Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required keys:
- `ANTHROPIC_API_KEY` — for Claude-based agents
- `OPENAI_API_KEY` — fallback LLM
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string

## Project Structure

```
dataflow-ai/
├── apps/web/          # Next.js 15 frontend
├── apps/api/          # FastAPI backend
├── packages/          # Python packages (agents, connectors, etc.)
├── infrastructure/    # Docker, Terraform, K8s manifests
├── tests/             # Unit, integration, E2E tests
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## Testing

```bash
# Run Python unit tests
cd apps/api && pytest tests/unit/ -v

# Run integration tests
pytest tests/integration/ -v

# Run E2E tests (requires running frontend + backend)
cd apps/web && npx playwright test

# Type-check frontend
cd apps/web && npx tsc --noEmit
```

## Code Style

- **Frontend:** TypeScript strict mode, no `any` types, ESLint + Prettier
- **Backend:** Pydantic for all request/response schemas, Black + Ruff for formatting
- **Commits:** Conventional commits format: `feat(scope): description`
