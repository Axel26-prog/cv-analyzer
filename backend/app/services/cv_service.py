import io
import pdfplumber
import docx
from app.services.cache_service import get_cached, set_cached
from app.services.analyzer import analyze_cv as _analyze_cv

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

    result = _analyze_cv(cv_text, job_description)
    set_cached(cv_text, job_description, result)
    return result