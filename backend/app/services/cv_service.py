import json
import io
import pdfplumber
import docx
from openai import OpenAI
from app.core.config import settings
from app.services.cache_service import get_cached, set_cached

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def extract_text(file_bytes: bytes, filename: str) -> str:
    filename_lower = filename.lower()
    if filename_lower.endswith(".pdf"):
        text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    elif filename_lower.endswith(".docx"):
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    else:
        raise ValueError("Formato no soportado. Solo PDF o DOCX.")

def analyze_cv(cv_text: str, job_description: str = "") -> dict:
    cached = get_cached(cv_text, job_description)
    if cached:
        return cached

    prompt = f"""
    Analyze this CV and respond ONLY with a valid JSON object, no markdown, no explanation.
    Use this exact structure:
    {{
      "score": <number 0-100>,
      "summary": "<2-3 sentence professional summary of the candidate>",
      "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
      "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
      "keywords_found": ["<keyword 1>", "<keyword 2>"],
      "keywords_missing": ["<keyword 1>", "<keyword 2>"],
      "ats_friendly": <true or false>,
      "sections": {{
        "experience": <true or false>,
        "education": <true or false>,
        "skills": <true or false>,
        "contact": <true or false>
      }}
    }}

    CV Content:
    {cv_text[:3000]}

    {"Job Description: " + job_description if job_description else "No job description provided."}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert HR analyst and ATS specialist."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.3
    )

    result = json.loads(response.choices[0].message.content)
    set_cached(cv_text, job_description, result)
    return result