# CV Analyzer

> AI-powered resume analysis with ATS scoring, keyword detection, and job description matching.

[![CI](https://github.com/Axel26-prog/cv-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/Axel26-prog/cv-analyzer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://cv-analyzer-mocha.vercel.app)

**[Live Demo](https://cv-analyzer-mocha.vercel.app)** · [Report a Bug](https://github.com/Axel26-prog/cv-analyzer/issues) · [Request a Feature](https://github.com/Axel26-prog/cv-analyzer/issues)

![CV Analyzer Screenshot](cvanalyzer2.jpg)

---

## What it does

Upload your CV (PDF or DOCX), optionally paste a job description, and get instant structured feedback:

- **ATS compatibility check** — know if your resume will pass applicant tracking systems
- **Overall score** out of 100 with breakdown by section
- **Keyword analysis** — found vs. missing keywords for the target role
- **Strengths & improvements** — actionable, specific feedback
- **Section detection** — flags missing sections (experience, education, skills, etc.)
- **Job match score** — tailored analysis when a job description is provided
- **Analysis history** — authenticated users can review all past analyses with full detail

---

## Architecture

```
┌─────────────────┐        ┌──────────────────────────────────────┐
│   React + Vite  │  HTTP  │           FastAPI backend            │
│   Tailwind CSS  │ ──────▶│                                      │
│   Vercel        │        │  ┌──────────┐   ┌─────────────────┐ │
└─────────────────┘        │  │ Auth     │   │ CV Analysis     │ │
                           │  │ JWT      │   │ OpenAI API      │ │
                           │  │ bcrypt   │   └────────┬────────┘ │
                           │  └──────────┘            │           │
                           │                          │           │
                           │  ┌──────────┐   ┌────────▼────────┐ │
                           │  │PostgreSQL│   │ Redis Cache     │ │
                           │  │SQLAlchemy│   │ (SHA-256 hash)  │ │
                           │  └──────────┘   └─────────────────┘ │
                           │  Railway                             │
                           └──────────────────────────────────────┘
```

**How caching works:** each uploaded CV is hashed (SHA-256). Before calling the OpenAI API, the backend checks Redis for an existing result with that hash + job description. Cache hit = instant response, no API cost.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Python 3.11, SQLAlchemy 2.0 |
| Auth | JWT (python-jose), passlib + bcrypt |
| AI | OpenAI API |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| File parsing | pdfplumber, python-docx |
| Monitoring | Sentry SDK, loguru |
| Migrations | Alembic |
| Infrastructure | Docker, docker-compose |
| CI/CD | GitHub Actions → Vercel (frontend) + Railway (backend) |

---

## Getting started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop (for local PostgreSQL and Redis)

### 1. Clone

```bash
git clone https://github.com/Axel26-prog/cv-analyzer.git
cd cv-analyzer
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

Starts PostgreSQL 16 on `5432` and Redis 7 on `6379`.

### 3. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
```

Create `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cv_analyzer
REDIS_URL=redis://localhost:6379
SECRET_KEY=your_secret_key_here
```

Run database migrations and start the server:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

App runs at `http://localhost:5173`.

---

## Deployment

Every push to `main` triggers automatic deploys on both platforms.

### Frontend → Vercel

1. Import the repo in [Vercel](https://vercel.com), set root directory to `frontend/`
2. Add environment variable: `VITE_API_URL` → your Railway backend URL
3. Vercel deploys automatically on every push to `main`

### Backend → Railway

1. Create a project in [Railway](https://railway.app), add PostgreSQL and Redis services
2. Add environment variables:

| Variable | Value |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `DATABASE_URL` | Provided by Railway PostgreSQL |
| `REDIS_URL` | Provided by Railway Redis |
| `SECRET_KEY` | A random secret string |

3. Railway deploys automatically on every push to `main`

> Make sure your backend's CORS settings include your Vercel domain.

---

## CI pipeline

Runs on every push to `main` and `feat/**` branches, and on pull requests to `main`.

```
push to main / feat/** / PR
           │
           ├── Backend checks (Python 3.11)
           │   ├── Spin up PostgreSQL 16 + Redis 7
           │   ├── Install dependencies
           │   └── Verify app imports successfully
           │
           └── Frontend checks (Node 20)
               ├── Install dependencies
               └── Production build (npm run build)
```

---

## Project structure

```
cv-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── api/
│   │   │   └── v1/            # API routes (versioned)
│   │   ├── core/              # Config, security, JWT
│   │   ├── db/                # Database session, connection
│   │   ├── models/            # SQLAlchemy models
│   │   ├── repositories/      # Data access layer
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # Business logic, OpenAI integration
│   ├── alembic/               # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── assets/            # Static assets
│   │   ├── api.js             # Axios API calls
│   │   ├── App.jsx            # Root component + routing
│   │   ├── AuthForm.jsx       # Login / register
│   │   └── History.jsx        # Analysis history view
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