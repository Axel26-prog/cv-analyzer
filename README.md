# CV Analyzer

> AI-powered resume analysis with ATS scoring, keyword detection, and job description matching.

[![CI](https://github.com/Axel26-prog/cv-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/Axel26-prog/cv-analyzer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://nice-beach-0041fbd0f.7.azurestaticapps.net)
[![Coverage](https://img.shields.io/badge/coverage-88%25-brightgreen)](https://github.com/Axel26-prog/cv-analyzer)

**[Live Demo](https://nice-beach-0041fbd0f.7.azurestaticapps.net)** · [Report a Bug](https://github.com/Axel26-prog/cv-analyzer/issues) · [Request a Feature](https://github.com/Axel26-prog/cv-analyzer/issues)

---

## Try it out

A test account is available — no registration needed:

| Field    | Value                  |
|----------|------------------------|
| Email    | `demo@cvanalyzer.com`  |
| Password | `Demo1234`             |

---

## What it does

Upload your CV (PDF or DOCX), optionally paste a job description, and get instant structured feedback:

- **ATS compatibility check** — know if your resume will pass applicant tracking systems
- **Overall score** out of 100 with visual radar chart breakdown (Format, Content, Relevance, ATS)
- **Keyword analysis** — found vs. missing keywords for the target role
- **Strengths & improvements** — actionable, specific feedback from GPT-4o-mini
- **Section detection** — flags missing sections (experience, education, skills, etc.)
- **Job match score** — tailored analysis when a job description is provided
- **Analysis history** — authenticated users can review all past analyses with full detail

---

## Architecture

```
┌─────────────────────┐          ┌────────────────────────────────────────────────┐
│                     │          │              FastAPI Backend                   │
│   React 18 + Vite   │  HTTPS   │                                                │
│   Tailwind CSS      │ ───────► │  ┌─────────────────┐   ┌────────────────────┐ │
│   Recharts          │          │  │   Auth Service  │   │   CV Analysis      │ │
│                     │          │  │   JWT / bcrypt  │   │   Azure OpenAI     │ │
│   ▲ Azure           │          │  │   OAuth2Bearer  │   │   pdfplumber       │ │
└─────────────────────┘          │  └─────────────────┘   └─────────┬──────────┘ │
                                  │                                   │            │
                                  │  ┌────────────────────────────────▼──────────┐ │
                                  │  │         Repository Pattern                │ │
                                  │  │         user_repo · cv_repo               │ │
                                  │  └───────────┬───────────────────┬───────────┘ │
                                  │              │                   │            │
                                  │  ┌───────────▼──────┐  ┌────────▼──────────┐ │
                                  │  │  PostgreSQL 16   │  │    Redis 7        │ │
                                  │  │  SQLAlchemy 2.0  │  │  SHA-256 cache    │ │
                                  │  │  users           │  │  24h TTL          │ │
                                  │  │  cv_analyses     │  │                   │ │
                                  │  └──────────────────┘  └───────────────────┘ │
                                  │  ▲ Railway                                    │
                                  └────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  🐳  Docker + docker-compose  —  full stack with a single command           │
  │      backend · frontend · postgres · redis · healthchecks                   │
  └──────────────────────────────────────────────────────────────────────────────┘
```

### How caching works

```
  Upload CV          SHA-256 Hash          Redis Lookup
  (PDF/DOCX)   ───►  text + job desc  ───►  check cache ──► HIT  ───► Return instantly (no API cost)
                                                         │
                                                         └──► MISS ──► Call OpenAI ──► Store + Return
```

---

## Technical Decisions

### Why FastAPI over Flask/Django?
- **FastAPI** has native async support with `async/await`, which is ideal for I/O-bound operations (file parsing, API calls, Redis lookups)
- Automatic OpenAPI docs (`/docs`) out of the box
- Pydantic validation is first-class, not an afterthought like in Flask (which needs `marshmallow` or similar)

### Why gpt-4o-mini?
- Cost-effective: ~$0.15/M tokens vs $3/M for gpt-4o
- Fast responses: adequate for structured CV analysis
- Supports `response_format={"type": "json_object"}` for more reliable JSON output

### Why temperature=0.3?
- Low variance: same CV should get similar analysis across runs
- High enough for natural language variation in recommendations, low enough to avoid "hallucinated" scores
- 0.0 would be too deterministic for open-ended feedback

### Why SHA-256 of CV text (not file)?
- A PDF/DOCX can be the same resume with different metadata (filename, modification date)
- Caching on file hash would cause unnecessary cache misses
- Text hash ensures identical content gets the same cached result

### Why streaming SSE?
- Reduces perceived latency from ~5s to near-instant first byte
- Users see partial JSON appearing character-by-character
- Better UX without complex polling or websockets

### System prompt design
- Compact but rule-dense: no backstory, just operational constraints
- Explicit edge case handling (empty CV, non-English, gaps without dates)
- Output constraints prevent GPT from adding markdown or explanations outside JSON
- Score validation via Pydantic `Field(ge=0, le=100)` — any score outside bounds is rejected

### Temperature rationale
| Value | Use case |
|-------|----------|
| 0.0 | Code generation, exact structure needed |
| 0.3 | **This project** — consistent but natural scores |
| 0.7 | Creative writing, brainstorming |
| 1.0+ | High variance, experimental |

---

## Tech Stack

| Layer          | Technology                                          |
|----------------|-----------------------------------------------------|
| Frontend       | React 18, Vite, Tailwind CSS, Axios, Recharts       |
| Backend        | FastAPI, Python 3.11, SQLAlchemy 2.0                |
| Auth           | JWT (python-jose), passlib + bcrypt                 |
| AI             | Azure OpenAI (gpt-4o) or OpenAI                     |
| Database       | PostgreSQL 16                                       |
| Cache          | Redis 7                                             |
| File parsing   | pdfplumber, python-docx                             |
| Monitoring     | Sentry SDK, loguru                                  |
| Testing        | pytest (88% coverage)                              |
| Infrastructure | Docker, docker-compose                              |
| CI/CD          | GitHub Actions → Azure Static Web Apps (frontend) + Railway (backend) |

---

## Getting Started

### Prerequisites

- Docker Desktop

### Full stack in one command

```bash
git clone https://github.com/Axel26-prog/cv-analyzer.git
cd cv-analyzer
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8080        |
| API Docs | http://localhost:8080/docs   |

### Local development (without Docker)

**1. Start only infrastructure:**

```bash
docker compose up postgres redis -d
```

**2. Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate     # Mac/Linux
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cv_analyzer
REDIS_URL=redis://localhost:6379
SECRET_KEY=your_secret_key_here
SENTRY_DSN=your_sentry_dsn        # optional
```

```bash
uvicorn app.main:app --reload
```

**3. Frontend:**

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Running Tests

```bash
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing
```

```
Name                            Stmts   Cover
---------------------------------------------
app/api/v1/auth.py                 29   100%
app/api/v1/cv.py                   33    85%
app/api/v1/deps.py                 19    84%
app/core/config.py                13   100%
app/core/security.py              16   100%
app/db/session.py                  6    33%
app/main.py                       22    82%
app/models/cv.py                  11   100%
app/models/user.py                 8   100%
app/repositories/cv_repo.py       10   100%
app/repositories/user_repo.py     12   100%
app/schemas/cv.py                 10   100%
app/schemas/user.py               15   100%
app/services/analyzer/            119    74%
app/services/auth_service.py      13   100%
app/services/cache_service.py     16    56%
app/services/cv_service.py        26   100%
---------------------------------------------
TOTAL                             389    88%
```

---

## CI Pipeline

```
push to main / feat/** / pull request
             │
             ├── Backend checks (Python 3.11)
             │       ├── Spin up PostgreSQL 16 + Redis 7
             │       ├── pip install -r requirements.txt
             │       └── pytest tests/ --cov=app  (88% coverage)
             │
             └── Frontend checks (Node 20)
                     ├── npm install
                     └── npm run build
             │
             ├── ✅ pass → auto deploy to Railway (backend)
             └── ✅ pass → auto deploy to Azure Static Web Apps (frontend)
```

---

## Deployment

### Frontend → Azure Static Web Apps

1. Create a Static Web App in [Azure Portal](https://portal.azure.com)
2. Connect to GitHub and configure:
   - **Build preset**: React
   - **App location**: `/frontend`
   - **Output location**: `dist`
3. Add environment variable in GitHub Actions workflow:
   - `VITE_API_URL` → your Railway backend URL + `/api/v1`
4. Deploys automatically on every push to `main`

### Backend → Railway

1. Create a project in [Railway](https://railway.app), add PostgreSQL and Redis services
2. Add environment variables:

| Variable        | Value                            |
|-----------------|----------------------------------|
| `DATABASE_URL`  | Provided by Railway PostgreSQL   |
| `REDIS_URL`     | Provided by Railway Redis        |
| `SECRET_KEY`    | A random secret string           |
| `SENTRY_DSN`    | Your Sentry DSN (optional)       |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint (optional) |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key (optional) |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Azure deployment name (optional) |

3. Railway deploys automatically on every push to `main`

### Azure OpenAI Configuration

The backend supports Azure OpenAI as an alternative to OpenAI. To enable, add these variables in Railway:

| Variable | Description |
|----------|-------------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint (e.g., `https://cv-analyzer.openai.azure.com`) |
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Deployment name (e.g., `gpt-4o`) |
| `AZURE_OPENAI_API_VERSION` | API version (default: `2024-05-01-preview`) |

### Azure Blob Storage

For storing CV files in Azure Blob Storage, add these variables in Railway:

| Variable | Description |
|----------|-------------|
| `AZURE_STORAGE_CONNECTION_STRING` | Connection string from Azure Storage |
| `AZURE_STORAGE_CONTAINER_NAME` | Container name (e.g., `cv-files`) |
| `AZURE_STORAGE_BLOB_URL` | Blob URL prefix (e.g., `https://youraccount.blob.core.windows.net`) |

---

## Project Structure

```
cv-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── api/v1/                 # Versioned API routes
│   │   ├── core/                   # Config, security, JWT
│   │   ├── db/                     # Database session
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── repositories/           # Data access layer
│   │   ├── schemas/                # Pydantic schemas
│   │   └── services/
│   │       ├── analyzer/           # AI analysis module
│   │       │   ├── __init__.py     # Public interface
│   │       │   ├── orchestrator.py # Flow coordination
│   │       │   ├── parser.py       # Pydantic validation
│   │       │   ├── llm_client.py   # OpenAI API calls + retry
│   │       │   ├── models.py       # CVAnalysis, ScoreBreakdown
│   │       │   ├── prompt_builder.py
│   │       │   └── exceptions.py
│   │       ├── prompts/            # Prompt templates (.txt)
│   │       ├── auth_service.py
│   │       ├── cv_service.py       # CV extraction + caching
│   │       ├── cache_service.py
│   │       └── storage_service.py   # Azure Blob Storage integration
│   ├── tests/                      # pytest (88% coverage)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api.js                  # Axios API calls
│   │   ├── App.jsx                 # Root component
│   │   ├── AuthForm.jsx            # Login / register
│   │   ├── AnalysisResults.jsx     # Score, radar chart, keywords
│   │   └── History.jsx             # Analysis history view
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .github/
    └── workflows/
        └── ci.yml
```

---

## License

MIT — feel free to use, modify, and distribute.