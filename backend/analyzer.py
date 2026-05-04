from openai import OpenAI
import os
import json
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class CVAnalysisError(Exception):
    pass

class EmptyCVError(CVAnalysisError):
    pass

class APIError(CVAnalysisError):
    pass

class InvalidResponseError(CVAnalysisError):
    pass

REQUIRED_FIELDS = ["score", "summary", "strengths", "improvements", "keywords_found", "keywords_missing", "ats_friendly", "sections"]
REQUIRED_SECTIONS = ["experience", "education", "skills", "contact"]

def analyze_cv(cv_text: str, job_description: str = "") -> dict:
    if not cv_text or not cv_text.strip():
        raise EmptyCVError("CV text cannot be empty")

    if len(cv_text.strip()) < 50:
        raise EmptyCVError("CV text is too short (minimum 50 characters)")

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

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert HR analyst and ATS specialist."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            timeout=30
        )
    except Exception as e:
        raise APIError(f"OpenAI API error: {str(e)}")

    content = response.choices[0].message.content
    if not content:
        raise InvalidResponseError("Empty response from OpenAI API")

    try:
        result = json.loads(content)
    except json.JSONDecodeError as e:
        raise InvalidResponseError(f"Invalid JSON response: {str(e)}")

    for field in REQUIRED_FIELDS:
        if field not in result:
            raise InvalidResponseError(f"Missing required field: {field}")

    if isinstance(result.get("sections"), dict):
        for section in REQUIRED_SECTIONS:
            if section not in result["sections"]:
                raise InvalidResponseError(f"Missing required section: {section}")

    if not isinstance(result.get("score"), (int, float)) or not 0 <= result["score"] <= 100:
        raise InvalidResponseError("Score must be a number between 0 and 100")

    return result