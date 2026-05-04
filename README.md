# CV Analyzer

> AI-powered resume analysis with ATS scoring, keyword detection, and job description matching.

[![CI](https://github.com/Axel26-prog/cv-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/Axel26-prog/cv-analyzer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://cv-analyzer-mocha.vercel.app)
[![Coverage](https://img.shields.io/badge/coverage-88%25-brightgreen)](https://github.com/Axel26-prog/cv-analyzer)

**[Live Demo](https://cv-analyzer-mocha.vercel.app)** · [Report a Bug](https://github.com/Axel26-prog/cv-analyzer/issues) · [Request a Feature](https://github.com/Axel26-prog/cv-analyzer/issues)

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
│                     │          │  │   JWT / bcrypt  │   │   OpenAI API       │ │
│   ▲ Vercel          │          │  │   OAuth2Bearer  │   │   pdfplumber       │ │
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

## Tech Stack

| Layer          | Technology                                          |
|----------------|-----------------------------------------------------|
| Frontend       | React 18, Vite, Tailwind CSS, Axios, Recharts       |
| Backend        | FastAPI, Python 3.11, SQLAlchemy 2.0                |
| Auth           | JWT (python-jose), passlib + bcrypt                 |
| AI             | OpenAI API (gpt-4o-mini)                            |
| Database       | PostgreSQL 16                                       |
| Cache          | Redis 7                                             |
| File parsing   | pdfplumber, python-docx                             |
| Monitoring     | Sentry SDK, loguru                                  |
| Testing        | pytest (88% coverage)                              |
| Infrastructure | Docker, docker-compose                              |
| CI/CD          | GitHub Actions → Vercel (frontend) + Railway (backend) |

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
             └── ✅ pass → auto deploy to Vercel  (frontend)
```

---

## Deployment

### Frontend → Vercel

1. Import the repo in [Vercel](https://vercel.com), set root directory to `frontend/`
2. Add environment variable: `VITE_API_URL` → your Railway backend URL + `/api/v1`
3. Vercel deploys automatically on every push to `main`

### Backend → Railway

1. Create a project in [Railway](https://railway.app), add PostgreSQL and Redis services
2. Add environment variables:

| Variable        | Value                            |
|-----------------|----------------------------------|
| `OPENAI_API_KEY`| Your OpenAI API key              |
| `DATABASE_URL`  | Provided by Railway PostgreSQL   |
| `REDIS_URL`     | Provided by Railway Redis        |
| `SECRET_KEY`    | A random secret string           |
| `SENTRY_DSN`    | Your Sentry DSN (optional)       |

3. Railway deploys automatically on every push to `main`

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
│   │       └── cache_service.py
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