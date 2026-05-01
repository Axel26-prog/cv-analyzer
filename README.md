# 📄 CV Analyzer

An AI-powered web application that analyzes your CV/resume and gives you instant, structured feedback — including an overall score, strengths, areas for improvement, keyword detection, and ATS compatibility.

🔗 **Live Demo:** [cv-analyzer-mocha.vercel.app](https://cv-analyzer-mocha.vercel.app)

---

## ✨ Features

- **Upload PDF or DOCX** — drag and drop or select your CV file
- **Optional job description** — paste a job posting to get a match score tailored to the role
- **Overall score** — rated out of 100
- **Strengths & improvements** — clear, actionable feedback
- **Keyword analysis** — shows found and missing keywords
- **ATS compatibility check** — know if your CV will pass applicant tracking systems
- **Section detection** — verifies presence of key CV sections (experience, education, skills, etc.)
- **User authentication** — register and log in to your account
- **Analysis history** — view your past CV analyses
- **Caching** — faster repeated analyses powered by Redis

---

## 🛠️ Tech Stack

**Frontend**
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- Deployed on **Vercel**

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/) — database
- [Redis](https://redis.io/) — caching
- [SQLAlchemy](https://www.sqlalchemy.org/) — ORM
- [pdfplumber](https://github.com/jsvine/pdfplumber) — PDF text extraction
- [python-docx](https://python-docx.readthedocs.io/) — DOCX text extraction
- [OpenAI API](https://openai.com/) — AI-powered analysis
- Deployed on **Railway**

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local PostgreSQL and Redis)

### 1. Clone the repository

```bash
git clone https://github.com/Axel26-prog/cv-analyzer.git
cd cv-analyzer
```

### 2. Start the database and cache (Docker)

```bash
docker-compose up -d
```

This starts PostgreSQL on port `5432` and Redis on port `6379`.

### 3. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create a `.env` file in the `backend/` folder:

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cv_analyzer
REDIS_URL=redis://localhost:6379
SECRET_KEY=your_secret_key
```

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## 🌐 Deployment

### Frontend → Vercel

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the root directory to `frontend/`
4. Set the environment variable:
   - `VITE_API_URL` → `https://your-backend.railway.app`
5. Deploy

### Backend → Railway

1. Create a new project in [Railway](https://railway.app)
2. Add a PostgreSQL and Redis service
3. Set the environment variables:
   - `OPENAI_API_KEY` → your OpenAI API key
   - `DATABASE_URL` → your Railway PostgreSQL URL
   - `REDIS_URL` → your Railway Redis URL
   - `SECRET_KEY` → a random secret string
4. Deploy

> ⚠️ Make sure your backend has CORS configured to allow requests from your Vercel domain.

---

## 📸 Screenshot

![CV Analyzer Screenshot](cvanalyzer2.jpg)
![CV Analyzer Screenshot](cvnanalyzer1.jpg)

---

## 📝 License

MIT — feel free to use, modify, and distribute.