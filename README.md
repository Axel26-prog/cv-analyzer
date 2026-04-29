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

---

## 🛠️ Tech Stack

**Frontend**
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- Deployed on **Vercel**

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/)
- [pdfplumber](https://github.com/jsvine/pdfplumber) — PDF text extraction
- [python-docx](https://python-docx.readthedocs.io/) — DOCX text extraction
- [Claude API (Anthropic)](https://www.anthropic.com/) — AI-powered analysis
- Deployed on **Railway**

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cv-analyzer.git
cd cv-analyzer
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Create a `.env` file in the `backend/` folder:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://127.0.0.1:8001
```

---

## 🌐 Deployment

### Frontend → Vercel

1. Push the `frontend/` folder to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the environment variable:
   - `VITE_API_URL` → `https://your-backend.railway.app`
4. Deploy

### Backend → Railway

1. Push the `backend/` folder to GitHub
2. Create a new project in [Railway](https://railway.app)
3. Set the environment variable:
   - `ANTHROPIC_API_KEY` → your Anthropic API key
4. Deploy

> ⚠️ Make sure your backend has CORS configured to allow requests from your Vercel domain.


---

## 📸 Screenshot

> _Add a screenshot of the app here_

---

## 📝 License

MIT — feel free to use, modify, and distribute.